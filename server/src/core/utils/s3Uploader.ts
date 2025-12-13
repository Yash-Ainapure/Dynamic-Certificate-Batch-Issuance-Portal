import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/aws-s3";
import { env } from "../../config/env";

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
