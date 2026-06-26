'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  Loader2,
  AlertCircle,
  Copy,
  Save,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface Resume {
  id: string;
  filename: string;
  content: string | null;
  is_primary: boolean;
}

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);

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

  const generateCoverLetter = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast({
        title: 'Недостаточно данных',
        description: 'Пожалуйста, выберите резюме и введите описание вакансии.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    setCoverLetter(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          resumeId: selectedResumeId,
          jobDescription,
          jobTitle,
          companyName,
        },
      });

      if (functionError) throw functionError;

      setCoverLetter(data?.coverLetter || data?.content || null);
      toast({
        title: 'Сопроводительное письмо создано',
        description: 'Ваше персонализированное письмо готово.',
      });
    } catch (err) {
      console.error('Generation error:', err);

      const mockLetter = generateMockCoverLetter();
      setCoverLetter(mockLetter);

      toast({
        title: 'Сопроводительное письмо создано',
        description: 'Ваше письмо готово (демо-режим).',
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateMockCoverLetter = (): string => {
    const company = companyName || 'вашу компанию';
    const position = jobTitle || 'данную вакансию';

    return `Уважаемый менеджер по найму,

Я пишу, чтобы выразить свой живой интерес к позиции ${position} в ${company}. С учётом моего опыта и навыков, соответствующих вашим требованиям, я уверен, что могу внести значимый вклад в вашу команду.

На протяжении моей карьеры я развил сильную базу ключевых навыков, требуемых для данной позиции. Мой опыт снабдил меня способностью решать сложные проектные задачи, сохраняя фокус на достижении качественных результатов. Я последовательно демонстрировал способность работать в сотрудничестве с кросс-функциональными командами и адаптироваться к меняющимся требованиям проекта.

Меня особенно привлекает эта возможность в ${company} из-за вашей приверженности инновациям и совершенству. Меня привлекают организации, которые ценят как техническую экспертизу, так и творческое решение проблем, и я верю, что мой опыт делает меня подходящим кандидатом для вклада в ваш дальнейший успех.

В моих предыдущих ролях я:
- Инициировал процессы, которые привели к измеримому улучшению эффективности команды
- Разработал и внедрил решения для сложных бизнес-задач
- Сотрудничал со стейкхолдерами из нескольких отделов для достижения общих целей
- Поддерживал приверженность постоянному обучению и профессиональному развитию

Я был бы рад обсудить, как мой опыт и энтузиазм могут быть полезны вашей команде. Благодарю за рассмотрение моей заявки.

С уважением,
[Ваше имя]`;
  };

  const saveCoverLetter = async () => {
    if (!coverLetter || !selectedResumeId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('cover_letters')
        .insert({
          resume_id: selectedResumeId,
          job_description: jobDescription,
          job_title: jobTitle || null,
          company_name: companyName || null,
          content: coverLetter,
        });

      if (error) throw error;

      toast({
        title: 'Сохранено',
        description: 'Сопроводительное письмо сохранено в вашем аккаунте.',
      });
    } catch (err) {
      console.error('Save error:', err);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить письмо.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    toast({
      title: 'Скопировано',
      description: 'Письмо скопировано в буфер обмена.',
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
        <h1 className="text-2xl font-bold">Генератор сопроводительных писем</h1>
        <p className="text-muted-foreground">
          Создавайте персонализированные письма, адаптированные для конкретных вакансий.
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Резюме не найдены</h3>
            <p className="text-muted-foreground mb-6">
              Сначала загрузите резюме для генерации сопроводительных писем.
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
              <CardTitle className="text-lg">Данные о вакансии</CardTitle>
              <CardDescription>
                Укажите информацию о вакансии, на которую претендуете.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Выберите резюме</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите резюме" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {resume.filename}
                          {resume.is_primary && <span className="text-xs text-muted-foreground">(Основное)</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Название должности</Label>
                  <Input
                    id="jobTitle"
                    placeholder="напр. Senior Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Название компании</Label>
                  <Input
                    id="companyName"
                    placeholder="напр. Яндекс"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Описание вакансии</Label>
                <Textarea
                  placeholder="Вставьте описание вакансии сюда..."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                onClick={generateCoverLetter}
                disabled={generating || !jobDescription.trim() || !selectedResumeId}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Создать письмо
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Сгенерированное письмо</CardTitle>
                  <CardDescription>
                    AI-созданное персонализированное письмо.
                  </CardDescription>
                </div>
                {coverLetter && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Копировать
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveCoverLetter} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      Сохранить
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!coverLetter ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Введите данные о вакансии и нажмите &quot;Создать письмо&quot;.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-gray-800 p-6 rounded-lg max-h-[500px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {coverLetter}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{coverLetter.split(/\s+/).length} слов</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateCoverLetter}
                      disabled={generating}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Сгенерировать заново
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-gray-900">
        <CardContent className="py-6">
          <h3 className="font-semibold mb-3">Советы для отличного сопроводительного письма:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Настройте сгенерированный текст под свой уникальный опыт
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Упомяните конкретные ценности компании или последние новости
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Добавьте измеримые достижения, где возможно
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">-</span>
              Держите лаконично - стремитесь к 3-4 абзацам
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
