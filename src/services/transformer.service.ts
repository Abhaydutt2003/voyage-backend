import { s3Service } from "./s3Service";

class TransformerService {
  /**
   * Replaces the array of S3 base keys at the given key in the object with presigned URLs.
   * @param obj The object to modify.
   * @param key The key in the object whose value is an array of S3 base keys.
   * @param expiry Optional expiry time in ms for the presigned URLs.
   * @param range Optional range for the number of keys to be converted.
   */
  async transformBaseKeysToPresignedUrls<T extends Record<string, any>>(
    obj: T,
    key: keyof T,
    expiry?: number,
    range?: number
  ): Promise<void> {
    let baseKeys = obj[key] as string[] | undefined;
    if (baseKeys && Array.isArray(baseKeys)) {
      let keysToConvert = range ? baseKeys.splice(0, range) : baseKeys;
      const presignedUrls = await s3Service.getGetPresignedUrls(
        keysToConvert,
        expiry
      );
      obj[key] = presignedUrls as any;
    }
  }
  /**
   * Applies the base key to presigned URL transformation to each object in the array.
   * @param arr The array of objects to modify.
   * @param key The key in each object whose value is an array of S3 base keys.
   * @param expiry Optional expiry time in ms for the presigned URLs.
   * @param range Optional range for the number of keys to be converted for each object.
   */
  async transformArrayBaseKeysToPresignedUrls<T extends Record<string, any>>(
    arr: T[],
    key: keyof T,
    expiry?: number,
    range?: number
  ): Promise<void> {
    await Promise.all(
      arr.map((obj) =>
        this.transformBaseKeysToPresignedUrls(obj, key, expiry, range)
      )
    );
  }
}

export const transformerService = new TransformerService();
