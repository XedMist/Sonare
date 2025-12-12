import { z } from 'zod';

const envSchema = z.object({
  MINIO_ENDPOINT: z.string().default('stream.sonare.click'),
  MINIO_PORT: z.coerce.number().default(443),
  MINIO_USE_SSL: z.coerce.boolean().default(true),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET_NAME: z.string().default('songs'),
});

// Validate environment variables
// We use safeParse to avoid crashing immediately if envs are missing during build/dev if not needed immediately
// But for runtime config it's better to throw.
const env = envSchema.parse(process.env);

export const config = {
  minio: {
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    bucketName: env.MINIO_BUCKET_NAME,
  },
};
