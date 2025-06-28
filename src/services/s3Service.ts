import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  config,
  FileInformation,
  UPLOAD_TYPE_TO_FOLDER,
  UploadType,
} from "../lib/filesConfig";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ApplicationError } from "../middlewares/error.middleware";

class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  #generateS3Key(uploadType: UploadType, fileName: string): string {
    const folder = UPLOAD_TYPE_TO_FOLDER[uploadType];
    const timestamp = Date.now(); // Keep the timestamp
    const sanitizedFileName = this.#sanitizeFileName(fileName);
    const fileNameParts = sanitizedFileName.split(".");
    const extension = fileNameParts.pop();
    const baseName = fileNameParts.join(".");
    const newFileName = `${baseName}_${timestamp}.${extension}`;
    return `${folder}/${newFileName}`;
  }

  #sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  async #generatePutPresignedUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: config.aws.bucketName,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, {
      expiresIn: config.files.presignedUrlExpiry,
    });
  }

  async getPutPresignedUrls(
    filesInformation: FileInformation[],
    uploadType: UploadType
  ) {
    const promises = filesInformation.map(async (fileInfo, index) => {
      try {
        const { fileName, fileType } = fileInfo;
        const s3Key = this.#generateS3Key(uploadType, fileName);
        const url = await this.#generatePutPresignedUrl(s3Key, fileType);
        return {
          index,
          result: { s3Key, url },
        };
      } catch (error) {
        throw new ApplicationError("Failed yo generate urls.");
      }
    });
    return await Promise.all(promises); //use promises.all instead of allSettled
  }
}

export const s3Service = new S3Service();
