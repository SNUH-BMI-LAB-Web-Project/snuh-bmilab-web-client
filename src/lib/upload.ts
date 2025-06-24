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

  // 1. 프리사인드 URL 발급
  const presigned = await api.generatePresignedUrl({
    domainType,
    fileName: file.name,
    contentType: file.type,
  });

  if (!presigned.presignedUrl || !presigned.uuid) {
    throw new Error('Presigned URL or UUID is missing.');
  }

  // 2. S3에 파일 업로드 (PUT 방식이 맞음)
  await fetch(presigned.presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  // 3. 직접 POST 요청으로 첨부파일 메타데이터 등록
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/files`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: presigned.uuid,
        fileName: file.name,
        extension: file.name.split('.').pop() ?? '',
        size: Number(file.size),
        domainType,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`File metadata registration failed: ${error}`);
  }

  return response.json(); // fileRecord
};
