import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/aws-s3";
import { env } from "../../config/env";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function uploadToS3(
  file: Express.Multer.File,
  folder: string
): Promise<string> {
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadBufferToS3(
  buffer: Buffer,
  contentType: string,
  folder: string,
  fileName: string
): Promise<string> {
  const key = `${folder}/${fileName}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteObjectByKey(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  );
}

export function extractS3KeyFromUrl(url: string): string | null {
  const prefix = `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/`;
  if (!url || !url.startsWith(prefix)) return null;
  return url.substring(prefix.length);
}

export async function deleteObjectByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const key = extractS3KeyFromUrl(url);
  if (!key) return;
  await deleteObjectByKey(key);
}
