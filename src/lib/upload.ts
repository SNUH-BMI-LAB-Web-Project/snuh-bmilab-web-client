import { FileApi, GeneratePresignedUrlDomainTypeEnum } from '@/generated-api';
import { Configuration } from '@/generated-api/runtime';

export const uploadFileWithPresignedUrl = async (
  file: File,
  accessToken: string,
  domainType: GeneratePresignedUrlDomainTypeEnum,
) => {
  const api = new FileApi(
    new Configuration({
      basePath: process.env.NEXT_PUBLIC_API_BASE_URL!,
      accessToken: async () => accessToken,
    }),
  );

  const presigned = await api.generatePresignedUrl({
    domainType,
    fileName: file.name,
    contentType: file.type,
  });

  if (!presigned.presignedUrl) {
    throw new Error('Presigned URL is undefined');
  }

  await fetch(presigned.presignedUrl, {
    method: 'POST',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  const fileRecord = await api.uploadFile({
    uploadFileRequest: {
      fileName: file.name,
      extension: file.name.split('.').pop(),
      size: file.size,
      domainType,
    },
  });

  return fileRecord;
};
