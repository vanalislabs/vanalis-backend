import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { GlobalSearchQueryDto } from "../dto/global-search-query.dto";
import { transformProjectListResponse } from "src/app/project/transform/project.transform";

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) { }

  async globalSearch(query: GlobalSearchQueryDto) {
    const { q } = query;

    const [projects, listings, users] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          OR: q ? [
            { title: { search: q } },
          ] : undefined,
        },
        orderBy: {
          title: 'asc',
        },
        take: 10,
      }),
      this.prisma.marketplaceListing.findMany({
        where: {
          OR: q ? [
            {
              project: {
                title: { search: q },
              },
            },
          ] : undefined,
        },
        orderBy: {
          project: {
            title: 'asc',
          }
        },
        take: 10,
      }),
      this.prisma.user.findMany({
        where: {
          OR: q ? [
            { username: { search: q } },
            { address: { search: q } },
            { email: { search: q } },
          ] : undefined,
        },
        orderBy: {
          username: 'asc',
        },
        take: 10,
      }),
    ]);

    const transformedProjects = await transformProjectListResponse(projects);

    return {
      projects: transformedProjects,
      listings,
      users,
    };
  }
}