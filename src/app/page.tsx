"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Filter,
  GitMerge,
  LayoutDashboard,
  Plus,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "Monitoring" | "Resolved" | "Archived";

type ErrorCase = {
  id: string;
  detectedAt: string;
  detectedBy: string;
  sourceType: string;
  jiraLink: string;
  logLink: string;
  impactDescription: string;
  comment: string;
};

type ErrorType = {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  symptom: string;
  rootCause: string;
  serviceName: string;
  processStage: string;
  severity: Severity;
  status: Status;
  owner: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalCount: number;
  trend: { month: string; count: number }[];
  cases: ErrorCase[];
};

type View =
  | "dashboard"
  | "errors"
  | "detail"
  | "error-form"
  | "case-form"
  | "merge";

const errorsSeed: ErrorType[] = [
  {
    id: "1",
    code: "CHK-001",
    name: "Таймаут запроса в сервисе проверки клиента",
    category: "Интеграция",
    subcategory: "Timeout",
    description:
      "Во время обращения к внешнему сервису проверки клиента запрос завершается по таймауту и процесс не получает результат проверки.",
    symptom:
      "На этапе верификации заявка зависает или получает технический отказ.",
    rootCause:
      "Нестабильный ответ внешнего сервиса и слишком агрессивный timeout в адаптере интеграции.",
    serviceName: "Client Check API",
    processStage: "Проверка клиента",
    severity: "Critical",
    status: "Open",
    owner: "Команда интеграций",
    firstSeenAt: "2025-11-05",
    lastSeenAt: "2026-03-24",
    totalCount: 143,
    trend: [
      { month: "Окт", count: 4 },
      { month: "Ноя", count: 12 },
      { month: "Дек", count: 17 },
      { month: "Янв", count: 21 },
      { month: "Фев", count: 38 },
      { month: "Мар", count: 51 },
    ],
    cases: [
      {
        id: "c1",
        detectedAt: "2026-03-24 14:20",
        detectedBy: "Поддержка L2",
        sourceType: "Prod incident",
        jiraLink: "JIRA-4812",
        logLink: "logs/client-check/tx-8124",
        impactDescription: "15 заявок не прошли автоматическую проверку.",
        comment: "Пик после релиза адаптера v2.3",
      },
      {
        id: "c2",
        detectedAt: "2026-03-19 09:12",
        detectedBy: "Системный аналитик",
        sourceType: "Monitoring",
        jiraLink: "JIRA-4768",
        logLink: "logs/client-check/tx-7810",
        impactDescription: "Рост среднего времени ответа до 18 секунд.",
        comment: "Повторяющийся паттерн на утренней нагрузке",
      },
      {
        id: "c3",
        detectedAt: "2026-03-02 16:44",
        detectedBy: "Архитектор",
        sourceType: "Postmortem",
        jiraLink: "JIRA-4621",
        logLink: "logs/client-check/tx-7203",
        impactDescription: "Остановка части бизнес-процесса проверки.",
        comment: "Подозрение на сетевую деградацию между контурами",
      },
    ],
  },
  {
    id: "2",
    code: "CHK-013",
    name: "Пустой ответ по клиенту из внешнего источника",
    category: "Данные",
    subcategory: "Empty payload",
    description:
      "Сервис проверки возвращает корректный HTTP-ответ, но без ожидаемого набора данных по клиенту.",
    symptom: "Невозможно принять решение по заявке без ручной проверки.",
    rootCause:
      "Неполная синхронизация данных поставщика и отсутствие валидации ответа.",
    serviceName: "External Profile Gateway",
    processStage: "Сбор данных",
    severity: "High",
    status: "Monitoring",
    owner: "Команда клиентских профилей",
    firstSeenAt: "2025-10-12",
    lastSeenAt: "2026-03-23",
    totalCount: 97,
    trend: [
      { month: "Окт", count: 9 },
      { month: "Ноя", count: 14 },
      { month: "Дек", count: 13 },
      { month: "Янв", count: 20 },
      { month: "Фев", count: 18 },
      { month: "Мар", count: 23 },
    ],
    cases: [
      {
        id: "c4",
        detectedAt: "2026-03-23 11:01",
        detectedBy: "Поддержка L1",
        sourceType: "User complaint",
        jiraLink: "JIRA-4804",
        logLink: "logs/profile/px-1188",
        impactDescription: "Оператор перевёл кейс в ручную обработку.",
        comment: "Чаще встречается для нерезидентов",
      },
    ],
  },
  {
    id: "3",
    code: "CHK-022",
    name: "Неконсистентный статус проверки после ретрая",
    category: "Бизнес-логика",
    subcategory: "State sync",
    description:
      "После повторной отправки запроса заявка получает статус, не соответствующий последнему результату проверки.",
    symptom: "В UI отображается устаревшее или противоречивое решение.",
    rootCause:
      "Гонка между асинхронным обновлением статуса и ретраем оркестратора.",
    serviceName: "Decision Orchestrator",
    processStage: "Принятие решения",
    severity: "Critical",
    status: "Open",
    owner: "Команда оркестрации",
    firstSeenAt: "2025-12-18",
    lastSeenAt: "2026-03-25",
    totalCount: 76,
    trend: [
      { month: "Окт", count: 0 },
      { month: "Ноя", count: 0 },
      { month: "Дек", count: 8 },
      { month: "Янв", count: 15 },
      { month: "Фев", count: 21 },
      { month: "Мар", count: 32 },
    ],
    cases: [
      {
        id: "c5",
        detectedAt: "2026-03-25 10:48",
        detectedBy: "Системный аналитик",
        sourceType: "Regression review",
        jiraLink: "JIRA-4821",
        logLink: "logs/orchestrator/rg-303",
        impactDescription: "Некорректный статус показан в 6 кейсах.",
        comment: "Воспроизводится после двойного ретрая",
      },
    ],
  },
  {
    id: "4",
    code: "CHK-031",
    name: "Ошибка маппинга кода причины отказа",
    category: "Справочники",
    subcategory: "Mapping",
    description:
      "Код причины отказа приходит из сервиса, но не сопоставляется с внутренним справочником.",
    symptom: "В интерфейсе поддержки отображается 'Неизвестная причина'.",
    rootCause: "Необновлённый словарь значений после изменения контракта.",
    serviceName: "Reason Dictionary",
    processStage: "Формирование результата",
    severity: "Medium",
    status: "Monitoring",
    owner: "Команда платформы",
    firstSeenAt: "2025-09-30",
    lastSeenAt: "2026-03-22",
    totalCount: 58,
    trend: [
      { month: "Окт", count: 10 },
      { month: "Ноя", count: 11 },
      { month: "Дек", count: 8 },
      { month: "Янв", count: 12 },
      { month: "Фев", count: 8 },
      { month: "Мар", count: 9 },
    ],
    cases: [],
  },
  {
    id: "5",
    code: "CHK-044",
    name: "Дублирование проверки при повторной отправке формы",
    category: "UI / UX",
    subcategory: "Duplicate submit",
    description:
      "Пользователь повторно отправляет запрос, и система создаёт дублирующие проверки.",
    symptom: "Резкий рост обращений в один и тот же момент времени.",
    rootCause: "Кнопка не блокируется в процессе отправки.",
    serviceName: "Front Capture Form",
    processStage: "Инициация проверки",
    severity: "High",
    status: "Resolved",
    owner: "Frontend команда",
    firstSeenAt: "2025-08-14",
    lastSeenAt: "2026-02-11",
    totalCount: 42,
    trend: [
      { month: "Окт", count: 9 },
      { month: "Ноя", count: 8 },
      { month: "Дек", count: 7 },
      { month: "Янв", count: 10 },
      { month: "Фев", count: 8 },
      { month: "Мар", count: 0 },
    ],
    cases: [],
  },
  {
    id: "6",
    code: "CHK-052",
    name: "Недоступность логов по ссылке из карточки инцидента",
    category: "Наблюдаемость",
    subcategory: "Broken link",
    description:
      "Ссылка на логирование ведёт в несуществующий namespace.",
    symptom: "Поддержка не может быстро подтвердить проявление ошибки.",
    rootCause: "Неверный шаблон генерации URL.",
    serviceName: "Observability Portal",
    processStage: "Диагностика",
    severity: "Low",
    status: "Archived",
    owner: "SRE",
    firstSeenAt: "2025-07-07",
    lastSeenAt: "2025-12-29",
    totalCount: 18,
    trend: [
      { month: "Окт", count: 5 },
      { month: "Ноя", count: 4 },
      { month: "Дек", count: 6 },
      { month: "Янв", count: 2 },
      { month: "Фев", count: 1 },
      { month: "Мар", count: 0 },
    ],
    cases: [],
  },
];

const categoryDistribution = [
  { name: "Интеграция", value: 8 },
  { name: "Данные", value: 6 },
  { name: "Бизнес-логика", value: 5 },
  { name: "Справочники", value: 4 },
  { name: "UI / UX", value: 3 },
  { name: "Наблюдаемость", value: 2 },
];

const monthlyDynamics = [
  { month: "Окт", count: 37 },
  { month: "Ноя", count: 49 },
  { month: "Дек", count: 51 },
  { month: "Янв", count: 80 },
  { month: "Фев", count: 94 },
  { month: "Мар", count: 124 },
];

const recentCases = errorsSeed
  .flatMap((e) =>
    e.cases.map((c) => ({
      ...c,
      errorCode: e.code,
      errorName: e.name,
      severity: e.severity,
    }))
  )
  .sort((a, b) => (a.detectedAt < b.detectedAt ? 1 : -1));

const pieColors = [
  "#dbeafe",
  "#bfdbfe",
  "#93c5fd",
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function severityTone(severity: Severity) {
  switch (severity) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function statusTone(status: Status) {
  switch (status) {
    case "Open":
      return "bg-red-50 text-red-700 border-red-200";
    case "Monitoring":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function MetricCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{hint}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-slate-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function RegistryErrorsPrototype() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [serviceName, setServiceName] = useState("all");

  const selected = errorsSeed.find((e) => e.id === selectedId) ?? errorsSeed[0];

  const filteredErrors = useMemo(() => {
    return [...errorsSeed]
      .filter((e) => {
        const searchable =
          `${e.code} ${e.name} ${e.category} ${e.serviceName}`.toLowerCase();
        return searchable.includes(query.toLowerCase());
      })
      .filter((e) => (category === "all" ? true : e.category === category))
      .filter((e) => (status === "all" ? true : e.status === status))
      .filter((e) => (severity === "all" ? true : e.severity === severity))
      .filter((e) => (serviceName === "all" ? true : e.serviceName === serviceName))
      .sort((a, b) => b.totalCount - a.totalCount);
  }, [query, category, status, severity, serviceName]);

  const totalTypes = errorsSeed.length;
  const totalCases = errorsSeed.reduce((sum, e) => sum + e.cases.length, 0);
  const activeCritical = errorsSeed.filter(
    (e) =>
      e.severity === "Critical" &&
      e.status !== "Resolved" &&
      e.status !== "Archived"
  ).length;
  const servicesAffected = new Set(errorsSeed.map((e) => e.serviceName)).size;

  const nav = [
    {
      key: "dashboard" as View,
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      key: "errors" as View,
      label: "Типы ошибок",
      icon: <ShieldAlert className="h-4 w-4" />,
    },
    {
      key: "detail" as View,
      label: "Карточка ошибки",
      icon: <ChevronRight className="h-4 w-4" />,
    },
    {
      key: "error-form" as View,
      label: "Форма ошибки",
      icon: <Plus className="h-4 w-4" />,
    },
    {
      key: "case-form" as View,
      label: "Новый случай",
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      key: "merge" as View,
      label: "Объединение",
      icon: <GitMerge className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-4 lg:p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Prototype UI
              </p>
              <h1 className="text-sm font-semibold leading-5">
                Реестр типовых ошибок
              </h1>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {nav.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                  view === item.key
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Для кого система
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <Users className="h-4 w-4" /> Системные аналитики
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <Server className="h-4 w-4" /> Архитекторы
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                <AlertTriangle className="h-4 w-4" /> Поддержка
              </div>
            </div>
          </div>
        </aside>

        <main className="p-4 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Внутренняя система анализа повторяющихся проблем
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  «Реестр типовых ошибок сервиса проверки клиентов»
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setView("merge")}
                >
                  Объединение дублей
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setView("case-form")}
                >
                  Добавить случай
                </Button>
                <Button
                  className="rounded-2xl"
                  onClick={() => setView("error-form")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать тип ошибки
                </Button>
              </div>
            </div>

            {view === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    title="Типов ошибок"
                    value={String(totalTypes)}
                    hint="Уникальные зарегистрированные типы"
                    icon={<ShieldAlert className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Случаев за период"
                    value={String(totalCases)}
                    hint="Последние зафиксированные проявления"
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Критичных активных"
                    value={String(activeCritical)}
                    hint="Требуют внимания сейчас"
                    icon={<AlertTriangle className="h-5 w-5" />}
                  />
                  <MetricCard
                    title="Затронуто сервисов"
                    value={String(servicesAffected)}
                    hint="Разные точки процесса проверки"
                    icon={<Server className="h-5 w-5" />}
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Динамика случаев по месяцам</CardTitle>
                      <CardDescription>
                        Показывает рост повторяемости проблем в сервисе проверки
                        клиентов
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyDynamics}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            fontSize={12}
                          />
                          <YAxis stroke="#64748b" fontSize={12} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#0f172a"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Распределение по категориям</CardTitle>
                      <CardDescription>
                        На что приходится основная масса типовых ошибок
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={2}
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={pieColors[index % pieColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Топ-10 ошибок по повторяемости</CardTitle>
                        <CardDescription>
                          Быстрый фокус на самых массовых проблемах
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => setView("errors")}
                      >
                        Открыть список
                      </Button>
                    </CardHeader>
                    <CardContent className="h-[360px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[...errorsSeed]
                            .sort((a, b) => b.totalCount - a.totalCount)
                            .slice(0, 6)}
                          layout="vertical"
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            type="number"
                            stroke="#64748b"
                            fontSize={12}
                          />
                          <YAxis
                            type="category"
                            dataKey="code"
                            width={70}
                            stroke="#64748b"
                            fontSize={12}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="totalCount"
                            radius={[0, 8, 8, 0]}
                            fill="#0f172a"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Последние добавленные случаи</CardTitle>
                      <CardDescription>Что происходило недавно</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {recentCases.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            const target = errorsSeed.find(
                              (e) => e.code === item.errorCode
                            );
                            if (target) setSelectedId(target.id);
                            setView("detail");
                          }}
                          className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.errorCode} · {item.errorName}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.detectedAt} · {item.detectedBy}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                "border",
                                severityTone(item.severity)
                              )}
                            >
                              {item.severity}
                            </Badge>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">
                            {item.impactDescription}
                          </p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {view === "errors" && (
              <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                  <CardHeader className="gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <CardTitle>Список типов ошибок</CardTitle>
                        <CardDescription>
                          Поиск повторяющихся проблем, фильтрация и переход в
                          карточку ошибки
                        </CardDescription>
                      </div>
                      <Button
                        className="rounded-2xl"
                        onClick={() => setView("error-form")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Создать тип ошибки
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <div className="relative xl:col-span-2">
                        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Поиск по коду, названию, категории, сервису"
                          className="rounded-2xl pl-9"
                        />
                      </div>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value ?? "all")}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Категория" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все категории</SelectItem>
                          {[...new Set(errorsSeed.map((e) => e.category))].map(
                            (item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Select
                        value={status}
                        onValueChange={(value) => setStatus(value ?? "all")}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Статус" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          {[...new Set(errorsSeed.map((e) => e.status))].map(
                            (item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Select
                        value={severity}
                        onValueChange={(value) => setSeverity(value ?? "all")}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все severity</SelectItem>
                          {[...new Set(errorsSeed.map((e) => e.severity))].map(
                            (item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Select
                        value={serviceName}
                        onValueChange={(value) => setServiceName(value ?? "all")}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue placeholder="Сервис" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все сервисы</SelectItem>
                          {[
                            ...new Set(errorsSeed.map((e) => e.serviceName)),
                          ].map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter className="h-4 w-4" /> Сортировка: по totalCount
                        ↓
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead>Сервис</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Total count</TableHead>
                            <TableHead>Last seen</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredErrors.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer hover:bg-slate-50"
                              onClick={() => {
                                setSelectedId(item.id);
                                setView("detail");
                              }}
                            >
                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {item.code}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{item.category}</TableCell>
                              <TableCell>{item.serviceName}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "border",
                                    severityTone(item.severity)
                                  )}
                                >
                                  {item.severity}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.totalCount}
                              </TableCell>
                              <TableCell>{item.lastSeenAt}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "border",
                                    statusTone(item.status)
                                  )}
                                >
                                  {item.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {view === "detail" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setView("errors")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    К списку
                  </Button>
                  <Badge className="border bg-slate-50 text-slate-700">
                    {selected.code}
                  </Badge>
                  <Badge className={cn("border", statusTone(selected.status))}>
                    {selected.status}
                  </Badge>
                  <Badge
                    className={cn("border", severityTone(selected.severity))}
                  >
                    {selected.severity}
                  </Badge>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {selected.name}
                      </CardTitle>
                      <CardDescription>
                        {selected.category} → {selected.subcategory} ·{" "}
                        {selected.serviceName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-900">
                            Описание
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selected.description}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-900">
                            Симптом
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selected.symptom}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                          <p className="text-sm font-medium text-slate-900">
                            Root cause
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selected.rootCause}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Process stage
                          </p>
                          <p className="mt-2 font-medium">
                            {selected.processStage}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Owner
                          </p>
                          <p className="mt-2 font-medium">{selected.owner}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            First / Last seen
                          </p>
                          <p className="mt-2 font-medium">
                            {selected.firstSeenAt} → {selected.lastSeenAt}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Total count
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {selected.totalCount}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Действия</CardTitle>
                      <CardDescription>
                        Ключевые пользовательские сценарии для аналитика и
                        поддержки
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full justify-start rounded-2xl"
                        onClick={() => setView("case-form")}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить случай
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-2xl"
                        onClick={() => setView("error-form")}
                      >
                        Редактировать
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start rounded-2xl"
                        onClick={() => setView("merge")}
                      >
                        <GitMerge className="mr-2 h-4 w-4" />
                        Объединить с другой ошибкой
                      </Button>
                      <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                        <div className="flex items-center gap-2 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Что даёт карточка
                        </div>
                        <p className="mt-2 leading-6">
                          Позволяет увидеть причину, симптом, историю повторений
                          и конкретные проявления ошибки в одном месте.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-3xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>График повторяемости</CardTitle>
                    <CardDescription>
                      Тренд выбранного типа ошибки по месяцам
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selected.trend}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          fontSize={12}
                        />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#0f172a"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>Таблица случаев ошибки</CardTitle>
                    <CardDescription>
                      Конкретные проявления, на основе которых считается
                      повторяемость
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead>Detected at</TableHead>
                            <TableHead>Detected by</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Jira</TableHead>
                            <TableHead>Логи</TableHead>
                            <TableHead>Impact</TableHead>
                            <TableHead>Комментарий</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selected.cases.length > 0 ? (
                            selected.cases.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell>{c.detectedAt}</TableCell>
                                <TableCell>{c.detectedBy}</TableCell>
                                <TableCell>{c.sourceType}</TableCell>
                                <TableCell>{c.jiraLink}</TableCell>
                                <TableCell>{c.logLink}</TableCell>
                                <TableCell>{c.impactDescription}</TableCell>
                                <TableCell>{c.comment}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className="py-10 text-center text-slate-500"
                              >
                                Пока нет связанных случаев для этой ошибки
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {view === "error-form" && (
              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>
                    Форма создания / редактирования типа ошибки
                  </CardTitle>
                  <CardDescription>
                    Секции сгруппированы так, чтобы аналитик быстро вносил
                    типовую ошибку и её диагностику
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="space-y-6 rounded-2xl border border-slate-200 p-5">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Основная информация
                        </h3>
                        <p className="text-sm text-slate-500">
                          Идентификация типа ошибки и её классификация
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Code">
                          <Input defaultValue="CHK-101" className="rounded-2xl" />
                        </Field>
                        <Field label="Name">
                          <Input
                            defaultValue="Ошибка валидации паспортных данных"
                            className="rounded-2xl"
                          />
                        </Field>
                        <Field label="Category">
                          <Select defaultValue="data">
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="integration">
                                Интеграция
                              </SelectItem>
                              <SelectItem value="data">Данные</SelectItem>
                              <SelectItem value="logic">
                                Бизнес-логика
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Subcategory">
                          <Input
                            defaultValue="Validation mismatch"
                            className="rounded-2xl"
                          />
                        </Field>
                      </div>
                    </div>

                    <div className="space-y-6 rounded-2xl border border-slate-200 p-5">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Контекст обработки
                        </h3>
                        <p className="text-sm text-slate-500">
                          Где проявляется проблема и кто за неё отвечает
                        </p>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Service name">
                          <Input
                            defaultValue="Passport Verification Adapter"
                            className="rounded-2xl"
                          />
                        </Field>
                        <Field label="Process stage">
                          <Input
                            defaultValue="Проверка документа"
                            className="rounded-2xl"
                          />
                        </Field>
                        <Field label="Severity">
                          <Select defaultValue="high">
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Status">
                          <Select defaultValue="open">
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="monitoring">
                                Monitoring
                              </SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field
                          label="Owner"
                          hint="Команда или ответственный специалист"
                        >
                          <Input
                            defaultValue="Команда KYC Platform"
                            className="rounded-2xl"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-5 xl:col-span-3">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">Диагностика</h3>
                        <p className="text-sm text-slate-500">
                          Описание, симптом и предполагаемая корневая причина
                        </p>
                      </div>
                      <div className="grid gap-4">
                        <Field label="Description">
                          <Textarea
                            className="min-h-[110px] rounded-2xl"
                            defaultValue="Система получает ответ от внешнего сервиса, но часть полей не проходит внутреннюю валидацию."
                          />
                        </Field>
                        <Field label="Symptom">
                          <Textarea
                            className="min-h-[100px] rounded-2xl"
                            defaultValue="Оператор видит технический отказ и переводит заявку в ручную обработку."
                          />
                        </Field>
                        <Field label="Root cause">
                          <Textarea
                            className="min-h-[110px] rounded-2xl"
                            defaultValue="Вероятное расхождение формата поля documentSeries после обновления контракта интеграции."
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => setView("errors")}
                    >
                      Отмена
                    </Button>
                    <Button
                      className="rounded-2xl"
                      onClick={() => setView("detail")}
                    >
                      Сохранить мок-тип ошибки
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {view === "case-form" && (
              <Card className="mx-auto max-w-4xl rounded-3xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Форма добавления случая ошибки</CardTitle>
                  <CardDescription>
                    Компактная форма для быстрого добавления очередного
                    проявления уже известного типа ошибки
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Detected at">
                      <Input type="datetime-local" className="rounded-2xl" />
                    </Field>
                    <Field label="Detected by">
                      <Input
                        defaultValue="Поддержка L2"
                        className="rounded-2xl"
                      />
                    </Field>
                    <Field label="Source type">
                      <Select defaultValue="incident">
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incident">
                            Prod incident
                          </SelectItem>
                          <SelectItem value="monitoring">
                            Monitoring
                          </SelectItem>
                          <SelectItem value="user">User complaint</SelectItem>
                          <SelectItem value="postmortem">Postmortem</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Jira link">
                      <Input defaultValue="JIRA-4901" className="rounded-2xl" />
                    </Field>
                    <Field label="Log link">
                      <Input
                        defaultValue="logs/client-check/tx-9001"
                        className="rounded-2xl"
                      />
                    </Field>
                    <Field label="Comment">
                      <Input
                        defaultValue="Повтор после пикового окна"
                        className="rounded-2xl"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4">
                    <Field label="Impact description">
                      <Textarea
                        className="min-h-[110px] rounded-2xl"
                        defaultValue="Не удалось автоматически завершить проверку клиента, часть кейсов ушла на ручную обработку."
                      />
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => setView("detail")}
                    >
                      Закрыть
                    </Button>
                    <Button
                      className="rounded-2xl"
                      onClick={() => setView("detail")}
                    >
                      Добавить случай
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {view === "merge" && (
              <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
                <Card className="rounded-3xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>Экран объединения дублей</CardTitle>
                    <CardDescription>
                      Слева — кандидаты на объединение, справа — итоговая
                      карточка и последствия merge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[errorsSeed[0], errorsSeed[2], errorsSeed[1]].map(
                      (item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            "w-full rounded-2xl border p-4 text-left transition",
                            idx === 0
                              ? "border-slate-900 bg-slate-50"
                              : "border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {item.code} · {item.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                {item.category} · {item.serviceName}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                "border",
                                severityTone(item.severity)
                              )}
                            >
                              {item.severity}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              Всего случаев: {item.totalCount}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              Last seen: {item.lastSeenAt}
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Предпросмотр результата объединения</CardTitle>
                      <CardDescription>
                        Основной тип ошибки остаётся, дубли архивируются и
                        переносят в него свои случаи
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Master record
                        </p>
                        <p className="mt-2 font-semibold">
                          CHK-001 · Таймаут запроса в сервисе проверки клиента
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          Сохранится как основной тип ошибки для дальнейшей
                          аналитики.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-dashed border-slate-300 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Duplicates
                        </p>
                        <p className="mt-2 font-semibold">CHK-022, CHK-013</p>
                        <p className="mt-2 text-sm text-slate-600">
                          Будут помечены как archived / merged и исчезнут из
                          активного списка.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                        <p className="text-sm font-medium">
                          Что изменится после объединения
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                          <li>• Счётчик totalCount объединится в одну запись</li>
                          <li>
                            • История случаев сохранится без потери ссылок на
                            Jira и логи
                          </li>
                          <li>
                            • Поиск и dashboard перестанут показывать
                            дублирующие типы ошибок
                          </li>
                          <li>
                            • В карточке останется traceability, откуда были
                            перенесены случаи
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Сравнение полей перед merge</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-hidden rounded-2xl border border-slate-200">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Поле</TableHead>
                              <TableHead>Master</TableHead>
                              <TableHead>Duplicate</TableHead>
                              <TableHead>Решение</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>
                                Таймаут запроса в сервисе проверки клиента
                              </TableCell>
                              <TableCell>
                                Неконсистентный статус проверки после ретрая
                              </TableCell>
                              <TableCell>
                                Оставить master, комментарий в audit trail
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Service</TableCell>
                              <TableCell>Client Check API</TableCell>
                              <TableCell>Decision Orchestrator</TableCell>
                              <TableCell>
                                Нужен manual review архитектора
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Root cause</TableCell>
                              <TableCell>
                                Нестабильный ответ внешнего сервиса
                              </TableCell>
                              <TableCell>
                                Гонка статусов при ретрае
                              </TableCell>
                              <TableCell>
                                Объединить notes и зафиксировать гипотезы
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="outline" className="rounded-2xl">
                          Отмена
                        </Button>
                        <Button className="rounded-2xl">
                          <GitMerge className="mr-2 h-4 w-4" />
                          Выполнить объединение
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <Card className="rounded-3xl border-dashed border-slate-300 bg-white/80 shadow-sm">
              <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Что демонстрирует этот мокап
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Структуру экранов, навигацию, сценарии добавления и анализа
                    ошибок, а также визуализацию повторяемости и дублей.
                  </p>
                </div>
                <Tabs defaultValue={view} className="w-full lg:w-auto">
                  <TabsList className="grid w-full grid-cols-3 rounded-2xl lg:w-[360px]">
                    <TabsTrigger
                      value="dashboard"
                      onClick={() => setView("dashboard")}
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="errors"
                      onClick={() => setView("errors")}
                    >
                      Реестр
                    </TabsTrigger>
                    <TabsTrigger
                      value="detail"
                      onClick={() => setView("detail")}
                    >
                      Карточка
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
