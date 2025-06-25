export interface FileInformation {
  fileName: string;
  fileType: string;
}

export const UPLOAD_TYPES = {
  PAYMENT_PROOF: "paymentProof",
  PROPERTY_IMAGE: "propertyImage",
} as const;

export type UploadType = (typeof UPLOAD_TYPES)[keyof typeof UPLOAD_TYPES];

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const UPLOAD_TYPE_TO_FOLDER: Record<UploadType, string> = {
  [UPLOAD_TYPES.PAYMENT_PROOF]: "paymentProofs",
  [UPLOAD_TYPES.PROPERTY_IMAGE]: "propertyImages",
};

export const config = {
  aws: {
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucketName: process.env.S3_BUCKET_NAME!,
  },
  files: {
    maxFiles: 10,
    maxFileNameLength: 255,
    presignedUrlExpiry: 900, // 15 minutes
  },
};
