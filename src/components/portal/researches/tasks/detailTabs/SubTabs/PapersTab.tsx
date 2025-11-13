'use client';

import { Button } from '@/components/ui/button';

export default function PapersTab({ papers }: { papers?: any[] }) {
  const data = papers || [
    {
      id: 1,
      title: 'Deep Learning Approaches for Medical Image Analysis',
      doi: '10.1234/example.2024.001',
      journal: 'Nature Medicine',
      year: '2024',
      firstAuthor: 'Kim, J.',
      correspondingAuthor: 'Lee, S.',
      abstract:
        'This study presents novel deep learning approaches for medical image analysis, demonstrating significant improvements in diagnostic accuracy...',
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          논문 (Publications)
        </h3>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          논문 추가
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((paper) => (
          <div
            key={paper.id}
            className="rounded-lg border border-gray-200 bg-gray-50 p-6"
          >
            <h4 className="mb-2 text-lg font-semibold text-gray-900">
              {paper.title}
            </h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>
                <span className="font-medium">Journal:</span> {paper.journal} (
                {paper.year})
              </div>
              <div>
                <span className="font-medium">DOI:</span>{' '}
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {paper.doi}
                </a>
              </div>
              <div>
                <span className="font-medium">First Author:</span>{' '}
                {paper.firstAuthor}
              </div>
              <div>
                <span className="font-medium">Corresponding Author:</span>{' '}
                {paper.correspondingAuthor}
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-medium text-gray-800">Abstract:</span>{' '}
                {paper.abstract}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
