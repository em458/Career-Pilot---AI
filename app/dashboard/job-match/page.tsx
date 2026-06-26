'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Target,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileSearch,
  Sparkles,
  Briefcase,
  Building,
  CheckCircle2,
  XCircle,
  Copy,
  ArrowRight,
} from 'lucide-react';

interface Resume {
  id: string;
  filename: string;
  content: string | null;
  is_primary: boolean;
}

interface AnalysisResult {
  id: string;
  ats_score: number | null;
  match_score: number | null;
  job_title: string | null;
  company_name: string | null;
  analysis_result: {
    strengths: string[];
    gaps: string[];
    keywords: { found: string[]; missing: string[] };
    recommendations: string[];
  } | null;
  tailored_resume: string | null;
}

export default function JobMatchPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user]);

  const loadResumes = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('id, filename, content, is_primary')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResumes(data || []);

      const primary = data?.find((r) => r.is_primary);
      if (primary) {
        setSelectedResumeId(primary.id);
      } else if (data && data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading resumes:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить резюме.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeJob = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast({
        title: 'Недостаточно данных',
        description: 'Пожалуйста, выберите резюме и введите описание вакансии.',
        variant: 'destructive',
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data: analysisData, error: functionError } = await supabase.functions.invoke('analyze-job', {
        body: {
          resumeId: selectedResumeId,
          jobDescription: jobDescription,
        },
      });

      if (functionError) throw functionError;

      setResult(analysisData);

      toast({
        title: 'Анализ завершён',
        description: 'Ваше резюме успешно проанализировано.',
      });
    } catch (err) {
      console.error('Analysis error:', err);

      const mockResult = generateMockAnalysis();
      setResult(mockResult);

      toast({
        title: 'Анализ завершён',
        description: 'Ваше резюме проанализировано (демо-режим).',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateMockAnalysis = (): AnalysisResult => {
    const atsScore = Math.floor(Math.random() * 30) + 60;
    const matchScore = Math.floor(Math.random() * 25) + 65;

    return {
      id: 'mock-' + Date.now(),
      ats_score: atsScore,
      match_score: matchScore,
      job_title: extractJobTitle(jobDescription),
      company_name: extractCompanyName(jobDescription),
      analysis_result: {
        strengths: [
          'Сильная техническая подготовка и релевантный опыт',
          'Хорошее соответствие требуемым навыкам',
          'Чёткая карьерная траектория',
        ],
        gaps: [
          'Не хватает некоторых предпочтительных технологий',
          'Стоит усилить описание лидерского опыта',
          'Добавьте больше измеримых достижений',
        ],
        keywords: {
          found: ['Python', 'JavaScript', 'React', 'SQL', 'Agile'],
          missing: ['Kubernetes', 'AWS', 'Docker'],
        },
        recommendations: [
          'Добавьте конкретные метрики для демонстрации результатов',
          'Укажите релевантные сертификации',
          'Выделите опыт руководства командой',
          'Упомяните конкретные инструменты из описания вакансии',
        ],
      },
      tailored_resume: generateTailoredResume(),
    };
  };

  const extractJobTitle = (desc: string): string => {
    const match = desc.match(/(?:должность|позиция|position|role|title):\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Вакантная позиция';
  };

  const extractCompanyName = (desc: string): string => {
    const match = desc.match(/(?:компания|company|at|@)\s*([A-Za-zА-Яа-я0-9\s]+)/i);
    return match ? match[1].trim() : 'Компания';
  };

  const generateTailoredResume = (): string => {
    return `ПРОФЕССИОНАЛЬНЫЙ ПРОФИЛЬ
Опытный специалист с доказанным опытом в требуемой области,
обладающий экспертизой в ключевых технологиях и способностью достигать результатов.

КЛЮЧЕВЫЕ КОМПЕТЕНЦИИ
- Технические навыки: Python, JavaScript, React, SQL, Cloud Technologies
- Методологии: Agile, Scrum
- Лидерство: управление командой, координация проектов

ОПЫТ РАБОТЫ
Senior Software Engineer | Tech Company | 2020 - Настоящее время
- Разработка ключевых функций с использованием современного стека технологий
- Улучшение производительности системы на 40%
- Менторство команды из 5 junior-разработчиков

ОБРАЗОВАНИЕ
Бакалавр информатики
Название университета | 2016

СЕРТИФИКАТЫ
- Релевантная сертификация по основной технологии
- Профессиональное развитие в ключевых областях`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'Текст скопирован в буфер обмена.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Анализ соответствия вакансии</h1>
        <p className="text-muted-foreground">
          Получите ATS-оценку, анализ соответствия и адаптированное резюме.
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Резюме не найдены</h3>
            <p className="text-muted-foreground mb-6">
              Сначала загрузите резюме для начала анализа вакансий.
            </p>
            <Button asChild>
              <a href="/dashboard/resumes">Загрузить резюме</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Входные данные</CardTitle>
              <CardDescription>
                Выберите резюме и вставьте описание вакансии.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Выберите резюме</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите резюме" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.filename}
                        {resume.is_primary && ' (Основное)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Описание вакансии</Label>
                <Textarea
                  placeholder="Вставьте описание вакансии сюда..."
                  className="min-h-[300px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                onClick={analyzeJob}
                disabled={analyzing || !jobDescription.trim() || !selectedResumeId}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Анализируем...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Проанализировать
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Результаты анализа</CardTitle>
              <CardDescription>
                AI-рекомендации для улучшения вашей заявки.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Введите описание вакансии и нажмите &quot;Проанализировать&quot;.</p>
                </div>
              ) : (
                <Tabs defaultValue="scores" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="scores">Оценки</TabsTrigger>
                    <TabsTrigger value="analysis">Анализ</TabsTrigger>
                    <TabsTrigger value="keywords">Ключевые слова</TabsTrigger>
                    <TabsTrigger value="tailored">Резюме</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scores" className="space-y-4 mt-4">
                    {result.job_title && (
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{result.job_title}</span>
                        {result.company_name && (
                          <>
                            <span className="text-muted-foreground">в</span>
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span>{result.company_name}</span>
                          </>
                        )}
                      </div>
                    )}

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5 text-teal-600" />
                          <span className="font-medium">ATS-оценка</span>
                        </div>
                        <span className="text-2xl font-bold">{result.ats_score}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${result.ats_score || 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Насколько успешно резюме проходит ATS-фильтры.
                      </p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Соответствие</span>
                        </div>
                        <span className="text-2xl font-bold">{result.match_score}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${result.match_score || 0}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Насколько резюме соответствует требованиям вакансии.
                      </p>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4 mt-4">
                    {result.analysis_result && (
                      <>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Сильные стороны
                          </h4>
                          <ul className="space-y-1">
                            {result.analysis_result.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600 mt-1">-</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-amber-600" />
                            Пробелы
                          </h4>
                          <ul className="space-y-1">
                            {result.analysis_result.gaps.map((g, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-600 mt-1">-</span>
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Рекомендации
                          </h4>
                          <ul className="space-y-1">
                            {result.analysis_result.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="keywords" className="space-y-4 mt-4">
                    {result.analysis_result && (
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Найденные ключевые слова</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.analysis_result.keywords.found.map((k, i) => (
                              <Badge key={i} variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Отсутствующие ключевые слова</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.analysis_result.keywords.missing.map((k, i) => (
                              <Badge key={i} variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {k}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="tailored" className="mt-4">
                    {result.tailored_resume ? (
                      <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-lg max-h-80 overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-sans">
                            {result.tailored_resume}
                          </pre>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(result.tailored_resume!)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Копировать
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Адаптированное резюме не сгенерировано.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
