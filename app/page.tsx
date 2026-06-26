'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import {
  FileSearch,
  Target,
  FileText,
  TrendingUp,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Briefcase,
  Users,
} from 'lucide-react';

const features = [
  { icon: FileSearch, title: 'ATS-анализ резюме', description: 'Получите детальные рекомендации о том, как ваше резюме проходит через системы отбора кандидатов (ATS).' },
  { icon: Target, title: 'Оценка соответствия вакансии', description: 'Узнайте, насколько ваше резюме соответствует требованиям конкретной вакансии и выявите пробелы.' },
  { icon: FileText, title: 'Адаптированные резюме', description: 'Получите оптимизированные версии резюме, настроенные для каждой конкретной вакансии.' },
  { icon: TrendingUp, title: 'Сопроводительные письма', description: 'Создавайте убедительные сопроводительные письма, соответствующие вашему резюме и вакансии.' },
  { icon: Sparkles, title: 'Анализ резюме', description: 'Глубокий анализ сильных и слабых сторон вашего резюме с рекомендациями по улучшению.' },
  { icon: Briefcase, title: 'План поиска работы', description: 'Персональная стратегия для максимальной эффективности вашего поиска работы.' },
];

const stats = [
  { value: '95%', label: 'Проходят ATS', icon: CheckCircle2 },
  { value: '3x', label: 'Больше собеседований', icon: TrendingUp },
  { value: '10k+', label: 'Пользователей', icon: Users },
];

const testimonials = [
  { quote: "CareerPilot AI изменил мой поиск работы. За две недели я получил 5 приглашений на собеседование, хотя раньше не получал ни одного отклика!", author: "Анна Петрова", role: "Python-разработчик", image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150" },
  { quote: "Функция ATS-оценки помогла понять, почему моё резюме не проходило фильтры. Это буквально изменило всё.", author: "Михаил Сидоров", role: "Product Manager", image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" },
  { quote: "Я откликнулся на 20 вакансий с адаптированными резюме и получил 8 ответов. Это 40% откликаемость!", author: "Елена Козлова", role: "UX-дизайнер", image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              AI-инструменты для карьеры
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Получите работу мечты с{' '}
              <span className="gradient-text">AI-инструментами</span> для карьеры
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Загрузите резюме, вставьте описание вакансии и мгновенно получите ATS-оценку,
              адаптированное резюме, сопроводительное письмо и стратегию поиска работы.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 h-12 px-8">
                  Начать бесплатно
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Узнать больше
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Без привязки карты. 3 бесплатных анализа.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-cyan-600" />
                  <span className="text-3xl sm:text-4xl font-bold gradient-text">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-slate-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Возможности</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Всё необходимое для получения работы
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Наш AI анализирует ваше резюме относительно описания вакансии и даёт практические рекомендации.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Как это работает</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Три шага к успеху</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Загрузите резюме', description: 'Загрузите ваше резюме в PDF. Наш AI извлечёт и проанализирует ваш опыт, навыки и достижения.' },
              { step: '02', title: 'Вставьте описание вакансии', description: 'Скопируйте и вставьте описание вакансии. Наш AI определит ключевые требования и необходимые навыки.' },
              { step: '03', title: 'Получите результат', description: 'Мгновенно получите ATS-оценку, анализ соответствия, адаптированное резюме и сопроводительное письмо.' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute -top-4 left-6 text-7xl font-bold text-slate-100 dark:text-gray-800 select-none">
                  {item.step}
                </div>
                <Card className="relative border-0 shadow-sm pt-12">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-slate-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Отзывы</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Нам доверяют соискатели</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-gray-900">
            <CardContent className="py-16 px-8">
              <BarChart3 className="w-16 h-16 text-cyan-600 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Готовы ускорить карьеру?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Присоединяйтесь к тысячам соискателей, которые получили работу мечты с CareerPilot AI.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 h-12 px-8">
                  Начать бесплатно
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
