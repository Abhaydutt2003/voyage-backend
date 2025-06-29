import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  config,
  FileInformation,
  UPLOAD_TYPE_TO_FOLDER,
  UploadType,
} from "../lib/filesConfig";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getCloudfrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import { ApplicationError } from "../middlewares/error.middleware";

class S3Service {
  private s3Client: S3Client;
  private cloudfrontDistributionDomain: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
    this.cloudfrontDistributionDomain = "https://dxasclf72vqk5.cloudfront.net";
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

  async #generateGetPresignedUrls(baseKey: string) {
    return getCloudfrontSignedUrl({
      url: `${this.cloudfrontDistributionDomain}/${baseKey}`,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID!,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60),
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
        throw new ApplicationError("Failed to generate urls.");
      }
    });
    return await Promise.all(promises); //use promises.all instead of allSettled
  }

  async getGetPresignedUrls(fileBaseKeys: string[]) {
    const promises = fileBaseKeys.map(async (singleBaseKey, index) => {
      try {
        const url = await this.#generateGetPresignedUrls(singleBaseKey);
        return url;
      } catch (error) {
        return ""; //will show nothing if unable to make the url.
      }
    });
    return await Promise.all(promises);
  }
}

export const s3Service = new S3Service();
