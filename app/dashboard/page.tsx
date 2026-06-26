'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  FileText,
  Target,
  Mail,
  TrendingUp,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface DashboardStats {
  resumeCount: number;
  analysisCount: number;
  coverLetterCount: number;
  avgAtsScore: number | null;
}

interface RecentActivity {
  id: string;
  type: 'analysis' | 'cover_letter';
  title: string;
  company?: string;
  score?: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    resumeCount: 0,
    analysisCount: 0,
    coverLetterCount: 0,
    avgAtsScore: null,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const { count: resumeCount } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true });

      const { data: analyses } = await supabase
        .from('job_analyses')
        .select('ats_score, job_title, company_name, created_at, id')
        .order('created_at', { ascending: false })
        .limit(5);

      const analysisCount = analyses?.length || 0;
      const avgAtsScore = analyses && analyses.length > 0
        ? analyses.reduce((acc, a) => acc + (a.ats_score || 0), 0) / analyses.length
        : null;

      const { count: coverLetterCount } = await supabase
        .from('cover_letters')
        .select('*', { count: 'exact', head: true });

      const { data: coverLetters } = await supabase
        .from('cover_letters')
        .select('id, job_title, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activity: RecentActivity[] = [
        ...(analyses || []).map((a) => ({
          id: a.id,
          type: 'analysis' as const,
          title: a.job_title || 'Анализ вакансии',
          company: a.company_name || undefined,
          score: a.ats_score || undefined,
          created_at: a.created_at,
        })),
        ...(coverLetters || []).map((c) => ({
          id: c.id,
          type: 'cover_letter' as const,
          title: c.job_title || 'Сопроводительное письмо',
          company: c.company_name || undefined,
          created_at: c.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setStats({
        resumeCount: resumeCount || 0,
        analysisCount,
        coverLetterCount: coverLetterCount || 0,
        avgAtsScore,
      });
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">С возвращением!</h1>
          <p className="text-muted-foreground">Обзор вашего прогресса в поиске работы.</p>
        </div>
        <Link href="/dashboard/job-match">
          <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Новый анализ
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resumeCount}</p>
                <p className="text-sm text-muted-foreground">Резюме</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.analysisCount}</p>
                <p className="text-sm text-muted-foreground">Анализов вакансий</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.coverLetterCount}</p>
                <p className="text-sm text-muted-foreground">Сопроводительных</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.avgAtsScore ? Math.round(stats.avgAtsScore) : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Средняя ATS-оценка</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              Загрузить резюме
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Загрузите новое резюме для анализа и оптимизации.
            </p>
            <Link href="/dashboard/resumes">
              <Button variant="outline" className="w-full">
                Управление резюме
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              Анализ соответствия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Получите ATS-оценку и адаптированное резюме для любой вакансии.
            </p>
            <Link href="/dashboard/job-match">
              <Button variant="outline" className="w-full">
                Начать анализ
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-600" />
              Сопроводительное письмо
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Создайте персонализированное сопроводительное письмо за секунды.
            </p>
            <Link href="/dashboard/cover-letter">
              <Button variant="outline" className="w-full">
                Создать письмо
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {stats.resumeCount === 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-gray-900">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Начните сейчас</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Загрузите резюме и начните анализировать вакансии, чтобы получить
              ATS-оценки, адаптированные резюме и многое другое.
            </p>
            <Link href="/dashboard/resumes">
              <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                Загрузить первое резюме
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
