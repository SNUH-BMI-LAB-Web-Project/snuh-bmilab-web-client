'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { researchCategories, researchStatuses, users } from '@/data/projects';
import {
  Project,
  ProjectFile,
  ResearchCategory,
  ResearchStatus,
} from '@/types/project';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Project) => void;
  isEditing?: boolean;
}

export function ProjectForm({
  initialData,
  onSubmit,
  isEditing = false,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project>({
    defaultValues: initialData || {
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      category: '' as ResearchCategory,
      status: '' as ResearchStatus,
      createdAt: '',
      leaderId: [],
      participantId: [],
      files: [],
    },
  });

  // 날짜 선택 상태
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.startDate ? new Date(initialData.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.endDate ? new Date(initialData.endDate) : undefined,
  );

  // 책임자 및 참여자 상태
  const [leaders, setLeaders] = useState<string[]>(initialData?.leaderId || []);
  const [participants, setParticipants] = useState<string[]>(
    initialData?.participantId || [],
  );

  // 파일 상태 – 기존 파일(ProjectFile)과 새 파일(File 객체)
  const [existingFiles, setExistingFiles] = useState<ProjectFile[]>(
    initialData?.files || [],
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // 사용자 태그 추가 상태
  const [leaderInput, setLeaderInput] = useState('');
  const [participantInput, setParticipantInput] = useState('');

  // 멘션 관련 상태
  const [showLeaderMentions, setShowLeaderMentions] = useState(false);
  const [showParticipantMentions, setShowParticipantMentions] = useState(false);
  const [leaderMentionFilter, setLeaderMentionFilter] = useState('');
  const [participantMentionFilter, setParticipantMentionFilter] = useState('');

  // 입력 필드 참조
  const leaderInputRef = useRef<HTMLInputElement>(null);
  const participantInputRef = useRef<HTMLInputElement>(null);

  // 멘션 필터링된 사용자
  const filteredLeaderMentions = users.filter(
    (user) =>
      !leaders.includes(user.name) &&
      user.name.toLowerCase().includes(leaderMentionFilter.toLowerCase()),
  );
  const filteredParticipantMentions = users.filter(
    (user) =>
      !participants.includes(user.name) &&
      user.name.toLowerCase().includes(participantMentionFilter.toLowerCase()),
  );

  // 책임자 입력 처리
  const handleLeaderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLeaderInput(value);

    if (value.includes('@')) {
      const lastAtIndex = value.lastIndexOf('@');
      const textAfterAt = value.substring(lastAtIndex + 1);
      setLeaderMentionFilter(textAfterAt);
      setShowLeaderMentions(true);
    } else {
      setShowLeaderMentions(false);
    }
  };

  // 참여자 입력 처리
  const handleParticipantInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value } = e.target;
    setParticipantInput(value);

    if (value.includes('@')) {
      const lastAtIndex = value.lastIndexOf('@');
      const textAfterAt = value.substring(lastAtIndex + 1);
      setParticipantMentionFilter(textAfterAt);
      setShowParticipantMentions(true);
    } else {
      setShowParticipantMentions(false);
    }
  };

  // 책임자 멘션 선택
  const selectLeaderMention = (name: string) => {
    const lastAtIndex = leaderInput.lastIndexOf('@');
    const newValue = `${leaderInput.substring(0, lastAtIndex)}${name} `;
    setLeaderInput(newValue);
    setShowLeaderMentions(false);

    if (leaderInputRef.current) {
      leaderInputRef.current.focus();
      const newCursorPosition = lastAtIndex + name.length + 1;
      setTimeout(() => {
        if (leaderInputRef.current) {
          leaderInputRef.current.selectionStart = newCursorPosition;
          leaderInputRef.current.selectionEnd = newCursorPosition;
        }
      }, 0);
    }
  };

  // 참여자 멘션 선택
  const selectParticipantMention = (name: string) => {
    const lastAtIndex = participantInput.lastIndexOf('@');
    const newValue = `${participantInput.substring(0, lastAtIndex)}${name} `;
    setParticipantInput(newValue);
    setShowParticipantMentions(false);

    if (participantInputRef.current) {
      participantInputRef.current.focus();
      const newCursorPosition = lastAtIndex + name.length + 1;
      setTimeout(() => {
        if (participantInputRef.current) {
          participantInputRef.current.selectionStart = newCursorPosition;
          participantInputRef.current.selectionEnd = newCursorPosition;
        }
      }, 0);
    }
  };

  // 책임자 추가
  const addLeader = () => {
    const names = leaderInput
      .split(/\s+/)
      .filter((name) => name.trim() !== '')
      .map((name) => (name.startsWith('@') ? name.substring(1) : name));

    const uniqueNames = [...new Set(names)];
    uniqueNames.forEach((name) => {
      if (
        name &&
        !leaders.includes(name) &&
        users.some((user) => user.name === name)
      ) {
        setLeaders((prev) => [...prev, name]);
      }
    });

    setLeaderInput('');
    setShowLeaderMentions(false);
  };

  // 참여자 추가
  const addParticipant = () => {
    const names = participantInput
      .split(/\s+/)
      .filter((name) => name.trim() !== '')
      .map((name) => (name.startsWith('@') ? name.substring(1) : name));

    const uniqueNames = [...new Set(names)];
    uniqueNames.forEach((name) => {
      if (
        name &&
        !participants.includes(name) &&
        users.some((user) => user.name === name)
      ) {
        setParticipants((prev) => [...prev, name]);
      }
    });

    setParticipantInput('');
    setShowParticipantMentions(false);
  };

  // 엔터 키 처리 (책임자)
  const handleLeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showLeaderMentions && filteredLeaderMentions.length > 0) {
        selectLeaderMention(filteredLeaderMentions[0].name);
      } else {
        addLeader();
      }
    } else if (e.key === 'Escape') {
      setShowLeaderMentions(false);
    } else if (e.key === 'ArrowDown' && showLeaderMentions) {
      e.preventDefault();
      const mentionList = document.getElementById('leader-mention-list');
      if (mentionList && mentionList.firstChild) {
        (mentionList.firstChild as HTMLElement).focus();
      }
    }
  };

  // 엔터 키 처리 (참여자)
  const handleParticipantKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showParticipantMentions && filteredParticipantMentions.length > 0) {
        selectParticipantMention(filteredParticipantMentions[0].name);
      } else {
        addParticipant();
      }
    } else if (e.key === 'Escape') {
      setShowParticipantMentions(false);
    } else if (e.key === 'ArrowDown' && showParticipantMentions) {
      e.preventDefault();
      const mentionList = document.getElementById('participant-mention-list');
      if (mentionList && mentionList.firstChild) {
        (mentionList.firstChild as HTMLElement).focus();
      }
    }
  };

  // 멘션 리스트 키보드 네비게이션
  const handleMentionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    type: 'leader' | 'participant',
  ) => {
    const mentionList = document.getElementById(
      type === 'leader' ? 'leader-mention-list' : 'participant-mention-list',
    );
    if (!mentionList) return;
    const items = Array.from(mentionList.children) as HTMLElement[];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (index < items.length - 1) {
        items[index + 1].focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index > 0) {
        items[index - 1].focus();
      } else if (type === 'leader' && leaderInputRef.current) {
        leaderInputRef.current.focus();
      } else if (type === 'participant' && participantInputRef.current) {
        participantInputRef.current.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'leader') {
        selectLeaderMention(filteredLeaderMentions[index].name);
      } else {
        selectParticipantMention(filteredParticipantMentions[index].name);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (type === 'leader') {
        setShowLeaderMentions(false);
        leaderInputRef.current?.focus();
      } else {
        setShowParticipantMentions(false);
        participantInputRef.current?.focus();
      }
    }
  };

  // 책임자 제거
  const removeLeader = (name: string) => {
    setLeaders(leaders.filter((leader) => leader !== name));
  };

  // 참여자 제거
  const removeParticipant = (name: string) => {
    setParticipants(participants.filter((participant) => participant !== name));
  };

  // 기존 파일 제거
  const removeExistingFile = (index: number) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  // 새 파일 제거
  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  // 폼 제출 처리 – ProjectFormData 구조에 맞게 최종 데이터 구성
  const handleFormSubmit = (formData: Project) => {
    const formattedStartDate = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    const finalData: Project = {
      ...formData,
      // 사용자가 입력한 값 외에 추가 필드 설정
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      // 편집 중이 아니라면 현재 날짜를 생성일로 지정하고, 생성자 UID는 실제 값으로 대체 필요
      createdAt: initialData?.createdAt || format(new Date(), 'yyyy-MM-dd'),
      authorId: initialData?.authorId || 'currentUserUID',
      // 파일은 기존 파일만 포함 (새 파일은 별도 업로드 후 변환 필요)
      files: existingFiles,
    };

    onSubmit(finalData);
  };

  // 외부 클릭 시 멘션 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        leaderInputRef.current &&
        !leaderInputRef.current.contains(event.target as Node) &&
        !document
          .getElementById('leader-mention-list')
          ?.contains(event.target as Node)
      ) {
        setShowLeaderMentions(false);
      }
      if (
        participantInputRef.current &&
        !participantInputRef.current.contains(event.target as Node) &&
        !document
          .getElementById('participant-mention-list')
          ?.contains(event.target as Node)
      ) {
        setShowParticipantMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">프로젝트 제목</Label>
                <Input
                  id="title"
                  placeholder="프로젝트 제목을 입력하세요"
                  {...register('title', {
                    required: '프로젝트 제목은 필수입니다',
                  })}
                />
                {errors.title && (
                  <p className="text-destructive text-sm">
                    {errors.title.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">연구 분야</Label>
                <Select
                  defaultValue={initialData?.category}
                  onValueChange={(value) =>
                    register('category').onChange({ target: { value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="연구 분야를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>연구 시작일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, 'PPP', { locale: ko })
                          : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>연구 종료일</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate
                          ? format(endDate, 'PPP', { locale: ko })
                          : '날짜 선택'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">연구 상태</Label>
                <Select
                  defaultValue={initialData?.status}
                  onValueChange={(value) =>
                    register('status').onChange({ target: { value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="연구 상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>책임자</Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {leaders.map((leader) => (
                    <Badge
                      key={leader}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {leader}
                      <button
                        type="button"
                        onClick={() => removeLeader(leader)}
                        className="hover:bg-muted ml-1 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">제거</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    ref={leaderInputRef}
                    placeholder="책임자 이름을 입력하세요 (@태그)"
                    value={leaderInput}
                    onChange={handleLeaderInputChange}
                    onKeyDown={handleLeaderKeyDown}
                  />
                  {showLeaderMentions && filteredLeaderMentions.length > 0 && (
                    <div
                      id="leader-mention-list"
                      className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
                    >
                      {filteredLeaderMentions.map((user, index) => (
                        <button
                          key={user.userId}
                          type="button"
                          className="hover:bg-muted focus:bg-muted w-full px-4 py-2 text-left focus:outline-none"
                          onClick={() => selectLeaderMention(user.name)}
                          onKeyDown={(e) =>
                            handleMentionKeyDown(e, index, 'leader')
                          }
                          tabIndex={0}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLeader}
                    disabled={!leaderInput.trim()}
                  >
                    추가
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>참여자</Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <Badge
                      key={participant}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {participant}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant)}
                        className="hover:bg-muted ml-1 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">제거</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Input
                    ref={participantInputRef}
                    placeholder="참여자 이름을 입력하세요 (@태그)"
                    value={participantInput}
                    onChange={handleParticipantInputChange}
                    onKeyDown={handleParticipantKeyDown}
                  />
                  {showParticipantMentions &&
                    filteredParticipantMentions.length > 0 && (
                      <div
                        id="participant-mention-list"
                        className="bg-background absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border shadow-md"
                      >
                        {filteredParticipantMentions.map((user, index) => (
                          <button
                            key={user.userId}
                            type="button"
                            className="hover:bg-muted focus:bg-muted w-full px-4 py-2 text-left focus:outline-none"
                            onClick={() => selectParticipantMention(user.name)}
                            onKeyDown={(e) =>
                              handleMentionKeyDown(e, index, 'participant')
                            }
                            tabIndex={0}
                          >
                            {user.name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                    disabled={!participantInput.trim()}
                  >
                    추가
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">프로젝트 내용</Label>
                <Textarea
                  id="content"
                  placeholder="프로젝트 내용을 입력하세요"
                  rows={8}
                  {...register('content')}
                />
              </div>
              <div className="space-y-2">
                <Label>첨부파일</Label>
                {existingFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-muted-foreground text-sm">기존 파일</p>
                    <ul className="space-y-2">
                      {existingFiles.map((file, index) => (
                        <li
                          key={file.name}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center">
                            <div className="ml-2">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {file.size}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExistingFile(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">제거</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {newFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-muted-foreground text-sm">새 파일</p>
                    <ul className="space-y-2">
                      {newFiles.map((file, index) => (
                        <li
                          key={file.name}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div className="flex items-center">
                            <div className="ml-2">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-muted-foreground text-sm">
                                {(file.size / 1024 / 1024).toFixed(2)}MB
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNewFile(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">제거</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    setNewFiles((prev) => [
                      ...prev,
                      ...Array.from(target.files ?? []),
                    ]);
                  }}
                />
                <p className="text-muted-foreground text-sm">
                  모든 사진, 동영상, PDF 등 파일을 첨부할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="submit">
              {isEditing ? '프로젝트 수정' : '프로젝트 등록'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
