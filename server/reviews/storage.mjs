import { S3Client, HeadObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileTypeFromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';

export function createStorage(env, dependencies = {}) {
  const bucket = env.REVIEWS_S3_BUCKET;
  const s3 = dependencies.client || new S3Client({ region: env.REVIEWS_S3_REGION || 'eu-west-1',
    endpoint: env.REVIEWS_S3_ENDPOINT || undefined, forcePathStyle: true,
    credentials: { accessKeyId: env.REVIEWS_S3_ACCESS_KEY, secretAccessKey: env.REVIEWS_S3_SECRET_KEY } });
  return {
    async ticket(upload) {
      return (dependencies.signPost || createPresignedPost)(s3, { Bucket: bucket, Key: upload.key, Expires: 60,
        Fields: { 'Content-Type': upload.type, success_action_status: '204' },
        Conditions: [['content-length-range', upload.size, upload.size], ['eq', '$Content-Type', upload.type], ['eq', '$success_action_status', '204']] });
    },
    async seal(upload, reviewId) {
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: upload.key }));
      if (head.ContentLength !== upload.size || head.ContentType !== upload.type) throw new Error('INVALID_FILE');
      const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: upload.key, Range: 'bytes=0-8191', IfMatch: head.ETag }));
      const type = await fileTypeFromBuffer(await object.Body.transformToByteArray());
      if (!type || type.mime !== upload.type) throw new Error('INVALID_FILE');
      const key = `reviews/${reviewId}/${randomUUID()}.${type.ext}`;
      await s3.send(new CopyObjectCommand({ Bucket: bucket, Key: key,
        CopySource: `${bucket}/${upload.key}`, CopySourceIfMatch: head.ETag,
        MetadataDirective: 'REPLACE', ContentType: type.mime, ContentDisposition: 'inline', CacheControl: 'private,max-age=60' }));
      return { key, type: type.mime, size: upload.size };
    },
    async url(media) {
      return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: media.key,
        ResponseContentType: media.type, ResponseContentDisposition: 'inline', ResponseCacheControl: 'private,max-age=60' }), { expiresIn: 300 });
    },
    async remove(key) { await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })); }
  };
}
