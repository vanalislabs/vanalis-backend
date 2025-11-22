import Busboy from 'busboy';
import { Request } from 'express';

export async function parseMultipartForm(
  req: Request,
  config?: Busboy.BusboyConfig,
): Promise<{ fields: Record<string, any>; files: any[] }> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      ...config,
    });
    const fields: Record<string, any> = {};
    const files: any[] = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks: Buffer[] = [];

      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        console.log('end');
        files.push({
          fieldname,
          filename,
          encoding,
          mimetype,
          buffer: Buffer.concat(chunks),
        });
      });
    });

    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value;
    });

    busboy.on('finish', () => {
      resolve({ fields, files });
    });

    busboy.on('error', reject);

    req.pipe(busboy);
  });
}