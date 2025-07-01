'use client';

import { useState, useEffect, JSX } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Dna,
  Microscope,
  Activity,
  Users,
  Mail,
  BookOpen,
  Award,
  Globe,
  Database,
  Cpu,
  Heart,
  Star,
  Zap,
  FileText,
  Waves,
} from 'lucide-react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scrollY, setScrollY] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [counters, setCounters] = useState({
    projects: 0,
    papers: 0,
    students: 0,
  });
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  const words = [
    'Bio-Medical Informatics Lab',
    'SNUH BMI Lab',
    'Healthcare AI Research',
  ];
  const fullText = words[currentWordIndex];

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 로드 애니메이션
  useEffect(() => {
    setIsVisible(true);

    // 카운터 애니메이션
    const animateCounters = () => {
      const targets = { projects: 25, papers: 150, students: 40 };
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step += 1;
        const progress = step / steps;
        setCounters({
          projects: Math.floor(targets.projects * progress),
          papers: Math.floor(targets.papers * progress),
          students: Math.floor(targets.students * progress),
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, increment);
    };

    setTimeout(animateCounters, 1000);
  }, []);

  // 타이핑 애니메이션 (여러 단어 순환)
  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!isDeleting && typedText === fullText) {
          setTimeout(() => setIsDeleting(true), 2000);
        } else if (isDeleting && typedText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        } else if (isDeleting) {
          setTypedText(fullText.slice(0, typedText.length - 1));
        } else {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }
      },
      isDeleting ? 50 : 100,
    );

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, fullText]);

  useEffect(() => {
    const particleElements = Array.from({ length: 30 }).map((_, i) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={i}
        className="animate-float absolute h-1 w-1 rounded-full bg-blue-300/30"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${4 + Math.random() * 6}s`,
        }}
      />
    ));
    setParticles(particleElements);
  }, []);

  const researchAreas = [
    {
      icon: Database,
      title: 'AI-driven Healthcare Research',
      subtitle: 'using EHR-based Knowledge Graphs',
      description: '전자의무기록 기반 지식그래프를 활용한 AI 헬스케어 연구',
      delay: 'delay-100',
    },
    {
      icon: Dna,
      title: 'AI-based Bioinformatics',
      subtitle: 'for Multi-omics Data Analysis',
      description: '다중오믹스 데이터 분석을 위한 AI 기반 생명정보학 연구',
      delay: 'delay-200',
    },
    {
      icon: Microscope,
      title: 'AI for Digital and Computational Pathology',
      subtitle: 'Advanced Pathology Analysis',
      description: '디지털 및 컴퓨터 병리학을 위한 AI 연구',
      delay: 'delay-300',
    },
    {
      icon: Activity,
      title: 'AI-powered Multi-modal Biosignal Research',
      subtitle: 'Comprehensive Signal Analysis',
      description: 'AI 기반 다중모달 생체신호 연구 및 분석',
      delay: 'delay-400',
    },
  ];

  const recruitmentAreas = [
    '디지털 병리 이미지를 인공지능으로 분석하는 computer vision 관련 연구',
    '심전도, 청진음, 생체신호 등 time-series 데이터를 활용한 Multimodal AI 모델 개발',
    'Single-cell 및 spatial transcriptomics 기반 multiomics AI 모델 개발',
    '의료 free text 분석을 위한 LLM/LMM 연구',
    'OMOP CDM 및 EMR 활용 지식그래프 구축 연구',
  ];

  return (
    <div
      style={{ minHeight: 'calc(100vh - 70px)' }}
      className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">{particles}</div>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0">
          <div className="animate-gradient-shift absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
            {/* Floating geometric shapes */}
            <div
              className="animate-bounce-slow absolute top-20 left-10 h-6 w-6 rounded-full bg-blue-400/20 opacity-40"
              style={{ animationDelay: '0s', animationDuration: '4s' }}
            />
            <div
              className="animate-bounce-slow absolute top-40 right-20 h-4 w-4 rounded-full bg-blue-300/30 opacity-50"
              style={{ animationDelay: '1s', animationDuration: '5s' }}
            />
            <div
              className="animate-bounce-slow absolute bottom-20 left-1/4 h-3 w-3 rounded-full bg-blue-200/25 opacity-35"
              style={{ animationDelay: '2s', animationDuration: '6s' }}
            />
            <div
              className="animate-spin-slow absolute top-1/3 right-1/3 h-8 w-8 rounded-full border border-blue-300/20"
              style={{ animationDuration: '20s' }}
            />
            <div
              className="animate-pulse-slow absolute bottom-1/3 left-1/3 h-12 w-12 rounded-full border border-blue-200/15"
              style={{ animationDuration: '4s' }}
            />

            {/* Subtle animated overlay */}
            <div className="animate-slide-x absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-8 py-24">
          <div
            className={`text-center transition-all duration-1500 ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0'
            }`}
          >
            {/* Logo/Icon with subtle glow */}
            <div className="mb-8">
              <div className="animate-pulse-glow mx-auto mb-6 flex h-28 w-28 transform items-center justify-center rounded-full bg-gradient-to-br from-blue-500/90 to-slate-600/90 shadow-xl shadow-blue-500/25 backdrop-blur-sm transition-all duration-500 hover:scale-110">
                <Brain className="animate-pulse-bright h-14 w-14 text-white" />
              </div>
              <div
                className="animate-fade-in-up mb-4 flex items-center justify-center gap-2"
                style={{ animationDelay: '0.5s' }}
              >
                {/* <Badge className="animate-shimmer border-0 bg-blue-500/80 text-white shadow-lg backdrop-blur-sm"> */}
                {/*   <Sparkles className="animate-spin-slow mr-2 h-4 w-4" /> */}
                {/*   Seoul National University Hospital */}
                {/* </Badge> */}
              </div>
            </div>

            {/* Main Title with stagger animation */}
            <div className="mb-8 space-y-4">
              <h1 className="mb-6 text-6xl font-bold tracking-tight text-white md:text-8xl">
                <span
                  className="animate-fade-in-up inline-block"
                  style={{ animationDelay: '0.2s' }}
                >
                  SNUH
                </span>{' '}
                <span
                  className="animate-fade-in-up inline-block"
                  style={{ animationDelay: '0.4s' }}
                >
                  BMI
                </span>{' '}
                <span
                  className="animate-fade-in-up inline-block"
                  style={{ animationDelay: '0.6s' }}
                >
                  Lab
                </span>
              </h1>
            </div>

            {/* Typing Animation */}
            <div
              className="animate-fade-in-up mb-8 h-8 text-xl text-blue-200 md:text-2xl"
              style={{ animationDelay: '0.8s' }}
            >
              <span className="font-mono">{typedText}</span>
              <span className="animate-pulse-bright text-2xl text-blue-300">
                |
              </span>
            </div>

            {/* Goal Statement */}
            <div
              className="animate-fade-in-up mx-auto mb-12 max-w-4xl text-lg leading-relaxed text-slate-300 md:text-xl"
              style={{ animationDelay: '1s' }}
            >
              <p>
                SNUH BMI lab aims to understand the intricate mechanisms of
                human disease by applying{' '}
                <span className="animate-pulse-bright font-semibold text-blue-200">
                  mathematics
                </span>{' '}
                and{' '}
                <span
                  className="animate-pulse-bright font-semibold text-blue-200"
                  style={{ animationDelay: '0.5s' }}
                >
                  computational data science
                </span>
                . To accomplish this, we combine statistics, data analysis,
                machine learning, and deep learning methodologies to extend the
                knowledge of disease.
              </p>
            </div>

            {/* Animated Stats */}
            {/* <div */}
            {/*   className="animate-fade-in-up mb-12 grid grid-cols-3 gap-8" */}
            {/*   style={{ animationDelay: '1.2s' }} */}
            {/* > */}
            {/*   {stats.map((stat, index) => ( */}
            {/*     <div key={index} className="group text-center"> */}
            {/*       <div className="animate-float mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/20 shadow-lg backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"> */}
            {/*         <stat.icon className="animate-pulse-bright h-8 w-8 text-blue-300" /> */}
            {/*       </div> */}
            {/*       <div className="animate-count-up mb-1 text-4xl font-bold text-white tabular-nums"> */}
            {/*         {stat.value} */}
            {/*         {stat.suffix} */}
            {/*       </div> */}
            {/*       <div className="text-sm text-blue-200">{stat.label}</div> */}
            {/*     </div> */}
            {/*   ))} */}
            {/* </div> */}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="animate-bounce-slow absolute bottom-8 left-1/2 -translate-x-1/2 transform">
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-blue-300/40 bg-gradient-to-b from-transparent to-blue-400/10">
            <div className="animate-pulse-bright mt-2 h-3 w-1 rounded-full bg-blue-400/60" />
          </div>
        </div>
      </section>

      {/* Research Areas Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 py-24">
        {/* Subtle background elements */}
        <div className="absolute inset-0">
          <div className="animate-slide-x absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400/50 to-slate-400/50" />
          <div className="animate-float absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-400/5" />
          <div
            className="animate-float absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-slate-400/5"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-8">
          <div className="mb-16 text-center">
            <div className="animate-fade-in-up mb-4 flex items-center justify-center gap-2">
              <Zap className="animate-pulse-bright h-6 w-6 text-blue-600" />
              <Badge className="animate-shimmer border-0 bg-blue-500/80 text-white">
                Research Areas
              </Badge>
            </div>
            <h2
              className="animate-fade-in-up mb-6 bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
              style={{ animationDelay: '0.2s' }}
            >
              Our Research Focus
            </h2>
            <p
              className="animate-fade-in-up mx-auto max-w-3xl text-xl text-slate-600"
              style={{ animationDelay: '0.4s' }}
            >
              Cutting-edge AI research in biomedical informatics across multiple
              domains
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {researchAreas.map((area) => (
              <Card
                key={area.title}
                className={`group animate-fade-in-up overflow-hidden border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 transition-all duration-700 hover:-translate-y-6 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/10 ${area.delay} transform backdrop-blur-sm hover:scale-[1.02]`}
              >
                <CardContent className="relative p-8">
                  {/* Subtle background decoration */}
                  <div className="animate-pulse-slow absolute top-0 right-0 h-32 w-32 translate-x-16 -translate-y-16 rounded-full bg-blue-400/5 transition-all duration-700 group-hover:scale-150 group-hover:bg-blue-400/10" />

                  {/* Floating particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        className="animate-float absolute h-1 w-1 rounded-full bg-blue-400/20"
                        style={{
                          left: `${20 + i * 25}%`,
                          top: `${15 + i * 20}%`,
                          animationDelay: `${i * 0.8}s`,
                          animationDuration: `${4 + i}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 flex items-start gap-6">
                    <div className="animate-pulse-glow flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/80 to-slate-600/80 shadow-lg transition-all duration-500 group-hover:scale-110">
                      <area.icon className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-slate-800 transition-colors duration-300 group-hover:text-blue-700">
                        {area.title}
                      </h3>
                      <p className="mb-3 text-sm font-medium text-blue-600">
                        {area.subtitle}
                      </p>
                      <p className="leading-relaxed text-slate-600">
                        {area.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-24">
        {/* Subtle background */}
        <div className="absolute inset-0">
          <div className="animate-float absolute top-20 right-20 h-96 w-96 rounded-full bg-blue-400/5" />
          <div
            className="animate-float absolute bottom-20 left-20 h-80 w-80 rounded-full bg-slate-400/5"
            style={{ animationDelay: '3s' }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="animate-fade-in-left">
              <div className="mb-6 flex items-center gap-2">
                <Globe className="animate-spin-slow h-6 w-6 text-blue-600" />
                <Badge className="border-0 bg-blue-500/80 text-white">
                  About BMI Lab
                </Badge>
              </div>
              <h2 className="mb-6 text-4xl font-bold text-slate-800">
                Advancing Healthcare Through
                <span className="animate-pulse-bright block text-blue-600">
                  AI Innovation
                </span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-slate-700">
                서울대학교병원 의생명정보학 연구실은 수학과 컴퓨터 데이터
                사이언스를 활용하여 인간 질병의 복잡한 메커니즘을 이해하고자
                합니다. 통계학, 데이터 분석, 머신러닝, 딥러닝 방법론을 결합하여
                질병에 대한 지식을 확장하고, 새로운 진단 및 치료 방법을
                제시합니다.
              </p>

              <div className="mb-8 grid grid-cols-2 gap-6">
                <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-500/10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-blue-500 shadow-lg transition-all duration-300 group-hover:scale-110">
                    <Cpu className="animate-pulse-bright h-8 w-8 text-white transition-transform duration-300 group-hover:scale-125" />
                  </div>
                  <h4 className="mb-1 font-semibold text-slate-800">
                    Healthcare
                  </h4>
                  <p className="text-sm text-slate-600">최첨단 AI 기술</p>
                </div>
                <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-500/10">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-blue-500 shadow-lg transition-all duration-300 group-hover:scale-110">
                    <Heart className="animate-pulse-bright h-8 w-8 text-white transition-transform duration-300 group-hover:scale-125" />
                  </div>
                  <h4 className="mb-1 font-semibold text-slate-800">
                    Healthcare
                  </h4>
                  <p className="text-sm text-slate-600">의료 혁신</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-right relative">
              <div className="group transform rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl shadow-slate-500/10 transition-all duration-700 hover:scale-105 hover:rotate-1">
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-blue-600 to-slate-800 p-6 text-white">
                  <div className="animate-pulse-slow absolute top-0 right-0 h-24 w-24 translate-x-12 -translate-y-12 rounded-full bg-white/5 transition-transform duration-700 group-hover:scale-150" />
                  <div className="animate-slide-x absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <h3 className="relative z-10 mb-2 text-xl font-bold">
                    Real Medical Data
                  </h3>
                  <p className="relative z-10 text-blue-100">
                    서울대학교병원의 실제 의료·생명 빅데이터 활용
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { text: '전자의무기록 (EMR)', icon: Database },
                    { text: '의료 이미지 & 동영상', icon: Microscope },
                    { text: '생체신호 데이터', icon: Waves },
                    { text: '유전체/후성유전체', icon: Dna },
                    { text: '의료 텍스트 데이터', icon: FileText },
                  ].map((item, index) => (
                    <div
                      key={item.text}
                      className="group/item flex items-center gap-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-3 transition-all duration-300 hover:translate-x-2 hover:shadow-lg"
                    >
                      <div
                        className="animate-pulse-bright h-3 w-3 rounded-full bg-blue-500/60"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-slate-600 transition-transform duration-300 group-hover/item:scale-110">
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-700 transition-colors duration-300 group-hover/item:text-slate-900">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 py-24">
        {/* Subtle background */}
        <div className="absolute inset-0">
          <div className="animate-slide-x absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400/30 to-slate-400/30" />
          <div className="animate-float absolute -top-20 -left-20 h-40 w-40 rounded-full bg-blue-400/5" />
          <div
            className="animate-float absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-slate-400/5"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-8">
          <div className="mb-16 text-center">
            <div className="animate-fade-in-up mb-4 flex items-center justify-center gap-2">
              <Users className="animate-bounce-slow h-6 w-6 text-blue-600" />
              <Badge className="animate-shimmer border-0 bg-blue-500/80 text-white">
                Join Us
              </Badge>
            </div>
            <h2
              className="animate-fade-in-up mb-6 bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700 bg-clip-text text-4xl leading-tight font-bold text-transparent md:text-5xl"
              style={{ animationDelay: '0.2s' }}
            >
              We&apos; re Hiring
            </h2>
            <p
              className="animate-fade-in-up mx-auto mb-12 max-w-3xl text-xl text-slate-600"
              style={{ animationDelay: '0.4s' }}
            >
              대학원생, 인턴 및 연구원을 상시 모집하고 있습니다
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Recruitment Areas */}
            <Card className="animate-fade-in-left border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-xl shadow-slate-500/10">
              <CardContent className="p-8">
                <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-800">
                  <BookOpen className="animate-pulse-bright h-6 w-6 text-blue-600" />
                  Research Areas We&apos;re Looking For
                </h3>
                <div className="space-y-4">
                  {recruitmentAreas.map((area, index) => (
                    <div
                      key={area}
                      className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-slate-600 shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-slate-700">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="animate-fade-in-right border border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-xl shadow-blue-500/10">
              <CardContent className="p-8">
                <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-800">
                  <Award
                    className="animate-bounce-slow h-6 w-6 text-blue-600"
                    style={{ animationDelay: '0.5s' }}
                  />
                  Requirements & Benefits
                </h3>

                <div className="space-y-6">
                  <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <h4 className="mb-3 font-semibold text-slate-800">
                      근무 조건
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 p-3 transition-transform duration-300 hover:translate-x-1">
                        <div className="animate-pulse-bright h-3 w-3 rounded-full bg-blue-500/60" />
                        <span className="text-slate-700">
                          Full-time: 최소 6개월 이상 근무 (월~금, 9am~6pm 기준)
                        </span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 p-3 transition-transform duration-300 hover:translate-x-1">
                        <div className="animate-pulse-bright h-3 w-3 rounded-full bg-blue-500/60" />
                        <span className="text-slate-700">
                          Part-Time: 최소 9개월 이상 & 주당 24시간 이상 근무
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <h4 className="mb-3 font-semibold text-slate-800">
                      전공 분야
                    </h4>
                    <p className="rounded-lg border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      컴퓨터공학, 통계학, 생명정보학, 의료정보학, 수학, 생물학,
                      의학, 약학, 간호학, 보건학 등 다양한 전공 환영
                    </p>
                  </div>

                  <div
                    className="animate-fade-in-up rounded-xl border border-blue-200 bg-gradient-to-r from-white to-blue-50 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    style={{ animationDelay: '0.6s' }}
                  >
                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
                      <Star className="animate-spin-slow h-5 w-5 text-blue-600" />
                      병역특례 전문연구요원
                    </h4>
                    <div className="space-y-2 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse-bright h-2 w-2 rounded-full bg-blue-500/60" />
                        <p>
                          헬스케어AI연구원에서 병역특례 전문연구요원 모집 중
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse-bright h-2 w-2 rounded-full bg-blue-500/60" />
                        <p>본인 TO 보유자만 지원 가능</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse-bright h-2 w-2 rounded-full bg-blue-500/60" />
                        <p>24년부터는 신규 정원 배정을 받지 못하고 있음</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 py-24">
        {/* Subtle background animation */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 h-2 w-2 animate-ping rounded-full bg-blue-300/30" />
          <div className="animate-pulse-slow absolute top-20 right-20 h-3 w-3 rounded-full bg-blue-200/20" />
          <div className="animate-bounce-slow absolute bottom-20 left-1/4 h-4 w-4 rounded-full bg-slate-400/20" />
          <div className="animate-slide-x absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-8">
          <div className="text-center">
            <h2 className="animate-fade-in-up mb-6 text-4xl font-bold text-white">
              Ready to Join Our Research?
            </h2>
            <p
              className="animate-fade-in-up mx-auto mb-12 max-w-2xl text-xl text-slate-300"
              style={{ animationDelay: '0.2s' }}
            >
              간단한 자유양식의 이력서(근무 가능 기간, 보유 기술, 지원 동기 등
              포함)를 보내주시면 연락드리겠습니다
            </p>

            <div
              className="animate-fade-in-up mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-slate-600 shadow-lg transition-transform duration-300">
                  <Mail className="animate-pulse-bright h-8 w-8" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold">Contact Email</p>
                  <p className="text-blue-200">bmilab.snuh@gmail.com</p>
                </div>
              </div>
            </div>

            <div
              className="animate-fade-in-up border-t border-slate-600 pt-8"
              style={{ animationDelay: '0.6s' }}
            >
              <p className="text-sm text-slate-400">
                PI: 김광수 교수 | 헬스케어AI연구원 인프라(플랫폼) 담당교수
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(180deg);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3) translateY(100px);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.9) translateY(0px);
          }
          100% {
            transform: scale(1) translateY(0px);
            opacity: 1;
          }
        }

        @keyframes pulse-bright {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slide-x {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes count-up {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
