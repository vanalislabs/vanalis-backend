import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { S3Service } from "src/shared/s3/s3.service";
import { RetrieveUrlQueryDto } from "../dto/retrieve-url-query.dto";
import { Project, ProjectStatus, Submission, SubmissionStatus, User } from "prisma/generated/client";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { NETWORK } from "src/constants/network.constants";
import { decryptFilePath } from "src/utils/encryption";
import { SuiClient } from "@mysten/sui/client";
import archiver from "archiver";
import path from "path";
import { tmpdir } from "os";
import { createWriteStream } from "fs";
import { promises as fs } from "fs";
import { PROJECT_DATASETS_ZIP_KEY } from "src/constants/storage.constants";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: SuiClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    this.client = new SuiClient({
      url: NETWORK?.rpcUrl || '',
    });
  }

  async getBaseUrl() {
    return this.s3Service.getS3PublicUrl('');
  }

  async retrieveUrl(query: RetrieveUrlQueryDto) {
    return this.s3Service.getS3PublicUrl(query.filePathKey);
  }

  async retrieveZipProjectSubmission(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: {
        id_network: {
          id: projectId,
          network: NETWORK?.env || '',
        },
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (project.curator !== user.address) {
      throw new BadRequestException('You are not allowed to zip project submissions');
    }

    if (!project.isDatasetZipped) {
      throw new BadRequestException('Project datasets submissions are not zipped');
    }

    const zipKey = PROJECT_DATASETS_ZIP_KEY(projectId);

    const signedUrl = await this.s3Service.getPresignedUrl(zipKey, 3600);

    return {
      signedUrl,
    };
  }

  async zipProjectSubmissions(projectId: string, user: User) {
    const project = await this.prisma.project.findUnique({
      where: {
        id_network: {
          id: projectId,
          network: NETWORK?.env || '',
        },
      },
    }) as (Project & { isDatasetZipped?: boolean }) | null;

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (project.curator !== user.address) {
      throw new BadRequestException('You are not allowed to zip project submissions');
    }

    if (project.status !== ProjectStatus.COMPLETED && Number(project.deadline) > Date.now()) {
      throw new BadRequestException('Project still going on');
    }

    const zipKey = PROJECT_DATASETS_ZIP_KEY(projectId);

    if (project.isDatasetZipped) {
      const signedUrl = await this.s3Service.getPresignedUrl(zipKey, 3600);

      return {
        signedUrl,
      };
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        projectId: project.id,
        network: NETWORK?.env || '',
        status: SubmissionStatus.APPROVED,
      },
    });

    if (!submissions.length) {
      throw new BadRequestException('No approved submissions found for this project');
    }

    const tempDir = await fs.mkdtemp(path.join(tmpdir(), 'vanalis-zip-'));
    const zipPath = path.join(tempDir, `${projectId}-listing.zip`);

    try {
      await this.buildZipFromSubmissions(submissions, zipPath);

      const buffer = await fs.readFile(zipPath);

      await this.s3Service.uploadFile({
        key: zipKey,
        body: buffer,
        contentType: 'application/zip',
        contentLength: buffer.length,
        acl: 'private',
      });
      fs.rm(zipPath, { force: true });

      await this.prisma.mediaFile.create({
        data: {
          name: `${projectId}-listing.zip`,
          mimeType: 'application/zip',
          extension: 'zip',
          filePathKey: zipKey,
          size: buffer.length,
          publicUrl: '',
          uploader: user.address,
        },
      });

      await this.prisma.project.update({
        where: {
          id_network: {
            id: project.id,
            network: project.network,
          },
        },
        data: {
          isDatasetZipped: true,
        },
      });

      const signedUrl = await this.s3Service.getPresignedUrl(zipKey, 3600);

      return {
        signedUrl,
      };
    } catch (error) {
      this.logger.error(`Error on zip project submissions: ${error}`);
      throw new BadRequestException('Error on zip project submissions');
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async buildZipFromSubmissions(
    submissions: Submission[],
    zipPath: string,
  ): Promise<void> {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const finalizePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('warning', (err) => {
        this.logger.warn(`Archive warning: ${err.message}`);
      });
      archive.on('error', (err) => reject(err));
    });

    archive.pipe(output);

    for (const submission of submissions) {
      const encryptedPath = await this.getSubmissionDatasetPath(submission.id);
      const keypair = await this.prisma.cryptoKeypair.findFirst({
        where: {
          publicKey: submission.fullDatasetPublicKey,
        },
      });

      if (!keypair) {
        throw new BadRequestException(`Keypair for submission dataset not found`);
      }

      const decryptedPath = await decryptFilePath(encryptedPath, keypair.privateKey);

      if (!decryptedPath) {
        throw new BadRequestException(`Failed to decrypt dataset path for submission ${submission.id}`);
      }

      const objectStream = await this.s3Service.getObjectStream(decryptedPath);
      const entryName = this.buildZipEntryName(decryptedPath, submission.id);

      archive.append(objectStream, { name: entryName });
    }

    archive.finalize();
    await finalizePromise;
  }

  private buildZipEntryName(filePathKey: string, fallbackId: string): string {
    const base = path.basename(filePathKey);
    const extension = path.extname(filePathKey);
    return base || `${fallbackId}${extension}`;
  }

  private async getSubmissionDatasetPath(submissionId: string): Promise<string> {
    const submissionObject = await this.client.getObject({
      id: submissionId,
      options: {
        showContent: true,
      },
    });

    const submissionFields: any = submissionObject?.data?.content?.dataType === 'moveObject'
      ? submissionObject?.data?.content?.fields
      : null;

    const encryptedPath = submissionFields?.full_dataset_path;

    if (!encryptedPath) {
      throw new BadRequestException(`Submission ${submissionId} does not have full_dataset_path`);
    }

    return String(encryptedPath);
  }
}