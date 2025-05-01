'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Column<T> {
  label: string;
  className?: string;
  cell: (row: T, index: number) => React.ReactNode;
}

export interface PaginatedTableProps<T> {
  data: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  showPagination?: boolean;
  itemsPerPageOptions?: number[];
  totalPage?: number;
  loading?: boolean;
}

export function PaginatedTable<T>({
  data,
  rowKey,
  columns,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  showPagination = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  totalPage,
  loading = false,
}: PaginatedTableProps<T>) {
  const totalPages = totalPage ?? 1;

  const currentItems = data;

  const changePage = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(clamped);
  };

  function renderTableBody() {
    if (loading) {
      return Array.from({ length: itemsPerPage }).map((_, idx) => (
        <TableRow
          key={crypto.randomUUID()}
          className={idx % 2 === 0 ? 'bg-muted/30' : 'bg-white'}
        >
          {columns.map((col) => (
            <TableCell key={`skeleton-${col.label}`} className="h-16">
              <div className={idx % 2 === 0 ? 'bg-muted/30' : 'bg-white'} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (currentItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            데이터가 없습니다
          </TableCell>
        </TableRow>
      );
    }

    return currentItems.map((row, rowIndex) => (
      <TableRow key={rowKey(row)}>
        {columns.map((col) => (
          <TableCell key={col.label} className={`h-16 ${col.className}`}>
            {col.cell(row, rowIndex)}
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.label} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableBody()}</TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => changePage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}개
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
