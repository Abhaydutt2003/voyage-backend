import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async uploadFilesToS3(
    files: Express.Multer.File[],
    keyStart: string
  ): Promise<string[]> {
    return await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `${keyStart}/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await new Upload({
          client: this.s3Client,
          params: uploadParams,
        }).done();

        return uploadResult.Location!;
      })
    );
  }
}

export const s3Service = new S3Service();
