'use client';

import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Building2 } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Бесплатный',
    description: 'Идеально для начала',
    price: '0 ₽',
    period: 'навсегда',
    icon: Sparkles,
    features: [
      '3 анализа резюме в месяц',
      'Базовая ATS-оценка',
      'Генерация сопроводительных писем',
      'Email-поддержка',
    ],
    cta: 'Начать',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Для активных соискателей',
    price: '990 ₽',
    period: 'в месяц',
    icon: Zap,
    features: [
      'Безлимитные анализы резюме',
      'Продвинутая ATS-оптимизация',
      'Генерация адаптированных резюме',
      'Безлимитные сопроводительные',
      'Анализ ключевых слов',
      'Стратегия поиска работы',
      'Приоритетная поддержка',
    ],
    cta: 'Попробовать бесплатно',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Корпоративный',
    description: 'Для команд и организаций',
    price: '2 990 ₽',
    period: 'в месяц',
    icon: Building2,
    features: [
      'Всё из Pro',
      '5 участников команды',
      'Аналитика команды',
      'Кастомные шаблоны',
      'API доступ',
      'Персональный менеджер',
      'SSO авторизация',
    ],
    cta: 'Связаться',
    href: 'mailto:sales@careerPilot.ai',
    popular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24">
        <section className="px-4 py-16 text-center">
          <Badge variant="secondary" className="mb-4">Тарифы</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Простые и понятные тарифы
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите план, подходящий для вашего поиска работы. Все планы включают 7-дневную гарантию возврата.
          </p>
        </section>

        <section className="px-4 pb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative border-0 shadow-lg ${
                  plan.popular ? 'md:scale-105 z-10 ring-2 ring-cyan-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500">
                      Популярный
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href}>
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 bg-slate-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Сравнение планов</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 pr-4 font-medium">Возможность</th>
                    <th className="text-center py-4 px-4 font-medium">Бесплатный</th>
                    <th className="text-center py-4 px-4 font-medium">Pro</th>
                    <th className="text-center py-4 px-4 font-medium">Корпоративный</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Анализы резюме', free: '3/мес', pro: 'Безлимитно', enterprise: 'Безлимитно' },
                    { feature: 'ATS-оценка', free: 'Базовая', pro: 'Продвинутая', enterprise: 'Продвинутая' },
                    { feature: 'Сопроводительные письма', free: '3/мес', pro: 'Безлимитно', enterprise: 'Безлимитно' },
                    { feature: 'Адаптированные резюме', free: '-', pro: 'Да', enterprise: 'Да' },
                    { feature: 'Анализ ключевых слов', free: '-', pro: 'Да', enterprise: 'Да' },
                    { feature: 'Участников команды', free: '1', pro: '1', enterprise: '5' },
                    { feature: 'API доступ', free: '-', pro: '-', enterprise: 'Да' },
                    { feature: 'Приоритетная поддержка', free: '-', pro: 'Да', enterprise: 'Да' },
                  ].map((row, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-4 pr-4 text-muted-foreground">{row.feature}</td>
                      <td className="text-center py-4 px-4">{row.free}</td>
                      <td className="text-center py-4 px-4">{row.pro}</td>
                      <td className="text-center py-4 px-4">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-900 dark:to-gray-900">
              <CardContent className="py-16 px-8">
                <Sparkles className="w-16 h-16 text-cyan-600 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Готовы получить работу мечты?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Присоединяйтесь к более чем 10 000 соискателей, которые улучшили свои заявки с CareerPilot AI.
                </p>
                <Link href={user ? '/dashboard' : '/signup'}>
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 h-12 px-8">
                    {user ? 'Перейти в панель' : 'Начать бесплатно'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
