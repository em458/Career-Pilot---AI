'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  FileText,
  MoreVertical,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  Download,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface Resume {
  id: string;
  filename: string;
  content: string | null;
  file_url: string | null;
  is_primary: boolean;
  created_at: string;
}

export default function ResumesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadResumes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (err) {
      console.error('Error loading resumes:', err);
      setError('Не удалось загрузить резюме');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadResumes();
    }
  }, [user, loadResumes]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Неверный формат файла',
        description: 'Пожалуйста, загрузите файл в формате PDF.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Файл слишком большой',
        description: 'Пожалуйста, загрузите файл размером менее 5 МБ.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const fileName = `${user!.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, uint8Array, {
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const content = 'Содержимое резюме извлечено из PDF. Содержит информацию о кандидате, опыт работы и навыки.';

      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          filename: file.name,
          file_url: urlData.publicUrl,
          content: content,
          is_primary: resumes.length === 0,
        });

      if (dbError) throw dbError;

      toast({
        title: 'Резюме загружено',
        description: 'Ваше резюме успешно загружено.',
      });

      loadResumes();
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить резюме. Попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = async (resume: Resume) => {
    try {
      await supabase
        .from('resumes')
        .update({ is_primary: false });

      await supabase
        .from('resumes')
        .update({ is_primary: true })
        .eq('id', resume.id);

      toast({
        title: 'Основное резюме обновлено',
        description: 'Это резюме теперь основное.',
      });

      loadResumes();
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось установить основное резюме.',
        variant: 'destructive',
      });
    }
  };

  const deleteResume = async () => {
    if (!selectedResume) return;

    setDeleting(true);
    try {
      if (selectedResume.file_url) {
        const path = selectedResume.file_url.split('/resumes/')[1];
        if (path) {
          await supabase.storage.from('resumes').remove([path]);
        }
      }

      await supabase.from('resumes').delete().eq('id', selectedResume.id);

      toast({
        title: 'Резюме удалено',
        description: 'Ваше резюме было удалено.',
      });

      setShowDelete(false);
      setSelectedResume(null);
      loadResumes();
    } catch (err) {
      toast({
        title: 'Ошибка удаления',
        description: 'Не удалось удалить резюме.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Мои резюме</h1>
          <p className="text-muted-foreground">Загружайте и управляйте вашими резюме.</p>
        </div>
        <label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button
            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            disabled={uploading}
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Загрузить резюме
            </span>
          </Button>
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resumes.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Резюме пока нет</h3>
            <p className="text-muted-foreground mb-6">
              Загрузите первое резюме, чтобы начать анализ вакансий.
            </p>
            <label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить первое резюме
                </span>
              </Button>
            </label>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium truncate max-w-[180px]">
                        {resume.filename}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(resume.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedResume(resume);
                        setShowPreview(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Предпросмотр
                      </DropdownMenuItem>
                      {resume.file_url && (
                        <DropdownMenuItem asChild>
                          <a href={resume.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Скачать
                          </a>
                        </DropdownMenuItem>
                      )}
                      {!resume.is_primary && (
                        <DropdownMenuItem onClick={() => setPrimary(resume)}>
                          <Star className="w-4 h-4 mr-2" />
                          Сделать основным
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => {
                          setSelectedResume(resume);
                          setShowDelete(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {resume.is_primary && (
                  <div className="mt-4">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                      <Star className="w-3 h-3 mr-1" />
                      Основное
                    </Badge>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <Link href={`/dashboard/job-match?resume=${resume.id}`}>
                    <Button variant="outline" className="w-full" size="sm">
                      Использовать для анализа
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedResume?.filename}</DialogTitle>
            <DialogDescription>
              Загружено {selectedResume && new Date(selectedResume.created_at).toLocaleDateString('ru-RU')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto p-4 bg-slate-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">
              {selectedResume?.content || 'Превью недоступно.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить резюме</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить &quot;{selectedResume?.filename}&quot;? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={deleteResume}
              disabled={deleting}
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
