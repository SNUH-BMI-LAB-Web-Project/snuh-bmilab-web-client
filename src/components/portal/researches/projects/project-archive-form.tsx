'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import {
  ProjectFileSummary,
  ProjectFileSummaryFileTypeEnum,
} from '@/generated-api/models/ProjectFileSummary';
import { ProjectApi } from '@/generated-api/apis/ProjectApi';
import { Download, Paperclip } from 'lucide-react';
import { downloadFileFromUrl } from '@/utils/download-file';
import { getApiConfig } from '@/lib/config';

const projectApi = new ProjectApi(getApiConfig());

interface ProjectArchiveFormProps {
  projectId?: number;
}

const FILE_TYPE_LABELS: Record<ProjectFileSummaryFileTypeEnum, string> = {
  [ProjectFileSummaryFileTypeEnum.General]: '기타',
  [ProjectFileSummaryFileTypeEnum.Irb]: 'IRB',
  [ProjectFileSummaryFileTypeEnum.Drb]: 'DRB',
  [ProjectFileSummaryFileTypeEnum.Meeting]: '타임라인',
};

export default function ProjectArchiveForm({
  projectId,
}: ProjectArchiveFormProps) {
  const [files, setFiles] = useState<ProjectFileSummary[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!projectId) return;

      try {
        const data = await projectApi.getAllProjectFiles({ projectId });
        setFiles(data.files ?? []);
      } catch {
        console.error('파일 불러오기 실패');
      }
    };

    fetchFiles();
  }, [projectId]);

  return (
    <div className="rounded-md border bg-white">
      {files.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 pl-4">파일 이름</TableHead>
              {/* <TableHead className="w-1/6 text-center">파일 크기</TableHead> */}
              <TableHead className="w-1/6 text-center">파일 타입</TableHead>
              <TableHead className="w-1/6 text-center">다운로드</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.fileId}>
                <TableCell className="pl-4 align-middle">
                  <div className="flex flex-row items-center gap-2">
                    <Paperclip className="size-4" />
                    <p>{file.fileName}</p>
                  </div>
                </TableCell>
                {/* <TableCell className="text-center"> */}
                {/*   {formatFileSize(file.size)} */}
                {/* </TableCell> */}
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {FILE_TYPE_LABELS[
                      file.fileType as ProjectFileSummaryFileTypeEnum
                    ] ?? '기타'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      downloadFileFromUrl(file.fileName!, file.uploadUrl!)
                    }
                  >
                    <Download />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
          등록된 자료가 없습니다.
        </div>
      )}
    </div>
  );
}
