"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  HeartHandshake,
  Sparkles,
  Languages,
  Printer,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { subscribeUsageCount, incrementUsageOncePerSession } from "@/lib/usage-stats";

const THEME = {
  aurora: ["#11A97D", "#3D7BF7", "#A047FF", "#FF7A59"],
  brand: "#3D7BF7",
  brand2: "#11A97D",
  bg: "#0B1020",
  card: "#0F1529",
  panel: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.14)",
  text: "#F8FAFC",
  muted: "#A8B1C7",
};

type Step = "start" | "form" | "result";
type Sex = "m" | "f" | null;
type Gestation = "term" | "preterm" | null;

type Checklist = {
  // 1) Общие данные
  ageMonths: string;
  ageYears: string;
  sex: Sex;
  gestation: Gestation;
  pretermWeeks: string;
  pregnancyNoIssues: boolean | null;

  // 2) Семейный анамнез
  famEarlyDeath: boolean;
  famWeakness: boolean;
  famConsanguinity: boolean;
  famSMN1Carrier: boolean;

  // 3) Двигательное развитие
  m0_head: boolean;
  m0_floppyLimbs: boolean;
  m0_frogPose: boolean;
  m0_noRoll: boolean;

  m6_noSit: boolean;
  m6_noStandSupport: boolean;
  m6_regression: boolean;

  m12_noWalk: boolean;
  m12_falls: boolean;
  m12_hardRise: boolean;
  m12_progressiveWeakness: boolean;

  // 4) Тонус и рефлексы
  tone_hypotonia: boolean;
  tone_reflexLow: boolean;
  tone_proximalWeak: boolean;

  // 5) Дыхание и кормление
  resp_paradox: boolean;
  resp_accessory: boolean;
  resp_infections: boolean;
  feed_fatigue: boolean;
  feed_chokeWeakCry: boolean;

  // 6) Осмотр
  exam_atrophy: boolean;
  exam_tongueFascic: boolean;
  exam_bellChest: boolean;
  exam_contractures: boolean;

  // 7) Интеллект и чувствительность
  neuro_intellectPreserved: boolean;
  neuro_sensationPreserved: boolean;
};

const DEFAULT: Checklist = {
  ageMonths: "",
  ageYears: "",
  sex: null,
  gestation: null,
  pretermWeeks: "",
  pregnancyNoIssues: null,

  famEarlyDeath: false,
  famWeakness: false,
  famConsanguinity: false,
  famSMN1Carrier: false,

  m0_head: false,
  m0_floppyLimbs: false,
  m0_frogPose: false,
  m0_noRoll: false,

  m6_noSit: false,
  m6_noStandSupport: false,
  m6_regression: false,

  m12_noWalk: false,
  m12_falls: false,
  m12_hardRise: false,
  m12_progressiveWeakness: false,

  tone_hypotonia: false,
  tone_reflexLow: false,
  tone_proximalWeak: false,

  resp_paradox: false,
  resp_accessory: false,
  resp_infections: false,
  feed_fatigue: false,
  feed_chokeWeakCry: false,

  exam_atrophy: false,
  exam_tongueFascic: false,
  exam_bellChest: false,
  exam_contractures: false,

  neuro_intellectPreserved: true,
  neuro_sensationPreserved: true,
};

function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const next = locale === "ru" ? "kz" : "ru";

  const handleSwitch = () => {
    const pathWithoutLocale = pathname.replace(/^\/(ru|kz)(?=\/|$)/, "");
    router.push(`/${next}${pathWithoutLocale || ""}`);
  };

  return (
    <motion.button
      type="button"
      onClick={handleSwitch}
      title={next.toUpperCase()}
      className="grid place-items-center rounded-full h-10 w-10 border shadow-lg"
      style={{ background: "rgba(255,255,255,0.08)", borderColor: THEME.border, color: THEME.text }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      aria-label="Switch language"
    >
      <Languages size={18} />
    </motion.button>
  );
}

function AuroraBG() {
  return (
    <div className="aurora-print-hide absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 h-[60rem] w-[60rem] rounded-full blur-3xl"
        initial={{ scale: 0.9, rotate: 0 }}
        animate={{ scale: [0.9, 1.05, 0.95, 1], rotate: [0, 45, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `conic-gradient(from 180deg, ${THEME.aurora.join(", ")})`,
          opacity: 0.22,
        }}
      />
      <motion.div
        className="absolute -bottom-60 -right-60 h-[50rem] w-[50rem] rounded-full blur-3xl"
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: [1, 0.92, 1.08, 1], rotate: [0, -35, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${THEME.brand2}, transparent 60%), radial-gradient(circle at 70% 70%, ${THEME.brand}, transparent 60%)`,
          opacity: 0.25,
        }}
      />
    </div>
  );
}

function ChipHeader({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow"
      style={{
        background: "linear-gradient(90deg, rgba(17,169,125,0.18), rgba(61,123,247,0.18))",
        color: THEME.text,
      }}
    >
      <span className="grid place-items-center">{icon}</span>
      {text}
    </span>
  );
}

function SmallInput({
  label,
  placeholder,
  value,
  onChange,
  rightHint,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rightHint?: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium flex items-center justify-between" style={{ color: THEME.text }}>
        <span>{label}</span>
        {rightHint ? (
          <span className="text-xs" style={{ color: THEME.muted }}>
            {rightHint}
          </span>
        ) : null}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
        style={{
          borderColor: THEME.border,
          background: "rgba(255,255,255,0.02)",
          color: THEME.text,
          backdropFilter: "blur(6px)",
        }}
      />
    </div>
  );
}

function TogglePill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: readonly { value: string; title: string }[];
}) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium" style={{ color: THEME.text }}>
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <motion.button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="rounded-2xl border px-3 py-2.5 text-sm text-left"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: value === o.value ? "0 8px 24px rgba(61,123,247,0.25)" : "0 1px 2px rgba(0,0,0,0.1)",
            }}
            style={{
              borderColor: THEME.border,
              background:
                value === o.value
                  ? "linear-gradient(90deg, rgba(17,169,125,0.25), rgba(61,123,247,0.25))"
                  : "rgba(255,255,255,0.02)",
              color: THEME.text,
              backdropFilter: "blur(6px)",
            }}
          >
            {o.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  text,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  text: string;
}) {
  return (
    <motion.label
      className="flex items-start gap-3 rounded-2xl border px-3 py-2.5 cursor-pointer select-none"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      animate={{
        boxShadow: checked ? "0 8px 24px rgba(61,123,247,0.22)" : "0 1px 2px rgba(0,0,0,0.1)",
      }}
      style={{
        borderColor: THEME.border,
        background: checked ? "rgba(61,123,247,0.14)" : "rgba(255,255,255,0.02)",
        color: THEME.text,
        backdropFilter: "blur(6px)",
      }}
    >
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[--accent]"
        style={{ ["--accent" as any]: THEME.brand }}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm leading-6">{text}</span>
    </motion.label>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-3xl border p-6 backdrop-blur-xl shadow-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold" style={{ color: THEME.text }}>
            {title}
          </div>
          {subtitle ? (
            <div className="text-sm mt-1" style={{ color: THEME.muted }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-2">{children}</div>
    </motion.div>
  );
}

function RiskMeter({ value }: { value: number }) {
  const radius = 80;
  const stroke = 16;
  const c = Math.PI * radius;
  const v = Math.max(0, Math.min(100, value));
  const dash = (v / 100) * c;
  const rest = c - dash;
  return (
    <motion.svg
      width={240}
      height={150}
      viewBox="0 0 240 150"
      aria-label="Индекс подозрения на СМА"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={THEME.brand2} />
          <stop offset="100%" stopColor={THEME.brand} />
        </linearGradient>
      </defs>
      <path
        d="M40 120 A90 90 0 0 1 200 120"
        fill="none"
        stroke={THEME.border}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <motion.path
        d="M40 120 A90 90 0 0 1 200 120"
        fill="none"
        stroke="url(#g2)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${rest}`}
        animate={{ strokeDasharray: [`0 ${c}`, `${dash} ${rest}`] }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <motion.text
        x="120"
        y="108"
        textAnchor="middle"
        fontWeight={800}
        fontSize={32}
        fill={THEME.text}
        key={Math.round(v)}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {Math.round(v)}%
      </motion.text>
    </motion.svg>
  );
}

function RiskBadge({
  highPriority,
  familyRisk,
  symptomCount,
}: {
  highPriority: boolean;
  familyRisk: boolean;
  symptomCount: number;
}) {
  const title = highPriority ? "Подозрение на СМА: ВЫСОКИЙ приоритет" : "Подозрение на СМА: низкая/неопределённая вероятность";
  const hint = familyRisk
    ? "Есть ≥1 «красный флаг» семейного анамнеза."
    : "Семейные «красные флаги» не отмечены.";
  const hint2 = `Симптомов (разделы 3–6): ${symptomCount}`;

  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="flex items-center justify-between gap-3">
        <ChipHeader icon={<HeartHandshake size={16} />} text="Оценка риска" />
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            color: THEME.text,
            background: highPriority
              ? "linear-gradient(90deg, rgba(255,122,89,0.22), rgba(160,71,255,0.22))"
              : "linear-gradient(90deg, rgba(17,169,125,0.18), rgba(61,123,247,0.18))",
          }}
        >
          {highPriority ? "HIGH" : "CHECK"}
        </span>
      </div>

      <div className="mt-3 text-sm font-semibold" style={{ color: THEME.text }}>
        {title}
      </div>
      <div className="mt-2 text-sm leading-6" style={{ color: THEME.muted }}>
        {hint}
        <br />
        {hint2}
      </div>
    </motion.div>
  );
}

function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="flex items-center gap-2">
        <ChipHeader icon={<Sparkles size={16} />} text={title} />
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((txt, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3 rounded-xl px-3 py-2"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.985 }}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span className="mt-0.5 shrink-0 rounded-full p-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Sparkles size={16} />
            </span>
            <span className="text-sm leading-6" style={{ color: THEME.text }}>
              {txt}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

function CheckedList({ title, lines }: { title: string; lines: string[] }) {
  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
        <div className="text-sm font-medium" style={{ color: THEME.text }}>
          {title}
        </div>
        <div className="mt-2 text-sm" style={{ color: THEME.muted }}>
          Ничего не отмечено.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
      <div className="text-sm font-medium" style={{ color: THEME.text }}>
        {title}
      </div>
      <ul className="mt-2 grid gap-1.5">
        {lines.map((l, i) => (
          <li key={i} className="text-sm leading-6" style={{ color: THEME.text }}>
            • {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SMAVOPChecklistApp() {
  const [step, setStep] = useState<Step>("start");
  const [data, setData] = useState<Checklist>(DEFAULT);

  const [usage, setUsage] = useState<number>(0);
  useEffect(() => {
    const unsub = subscribeUsageCount(setUsage);
    return () => unsub();
  }, []);
  useEffect(() => {
    if (step === "result") incrementUsageOncePerSession();
  }, [step]);

  const familyRisk = useMemo(() => {
    return data.famEarlyDeath || data.famWeakness || data.famConsanguinity || data.famSMN1Carrier;
  }, [data]);

  const symptomCount = useMemo(() => {
    const motor =
      (data.m0_head ? 1 : 0) +
      (data.m0_floppyLimbs ? 1 : 0) +
      (data.m0_frogPose ? 1 : 0) +
      (data.m0_noRoll ? 1 : 0) +
      (data.m6_noSit ? 1 : 0) +
      (data.m6_noStandSupport ? 1 : 0) +
      (data.m6_regression ? 1 : 0) +
      (data.m12_noWalk ? 1 : 0) +
      (data.m12_falls ? 1 : 0) +
      (data.m12_hardRise ? 1 : 0) +
      (data.m12_progressiveWeakness ? 1 : 0);

    const tone = (data.tone_hypotonia ? 1 : 0) + (data.tone_reflexLow ? 1 : 0) + (data.tone_proximalWeak ? 1 : 0);

    const resp =
      (data.resp_paradox ? 1 : 0) +
      (data.resp_accessory ? 1 : 0) +
      (data.resp_infections ? 1 : 0) +
      (data.feed_fatigue ? 1 : 0) +
      (data.feed_chokeWeakCry ? 1 : 0);

    const exam =
      (data.exam_atrophy ? 1 : 0) +
      (data.exam_tongueFascic ? 1 : 0) +
      (data.exam_bellChest ? 1 : 0) +
      (data.exam_contractures ? 1 : 0);

    return motor + tone + resp + exam;
  }, [data]);

  const severeResp = useMemo(() => {
    return data.resp_paradox || data.resp_accessory || data.feed_chokeWeakCry;
  }, [data]);

  // Логика приоритета (консервативно, чтобы не пропустить):
  // - семейный риск (≥1 флаг) = высокий приоритет
  // - или ≥2 симптома (разделы 3–6) = высокий приоритет
  // - или тяжёлые дыхательные/кормление признаки = высокий приоритет
  const highPriority = useMemo(() => {
    return familyRisk || symptomCount >= 2 || severeResp;
  }, [familyRisk, symptomCount, severeResp]);

  const suspicionIndex = useMemo(() => {
    // UI-индекс (не медицинская шкала), чтобы удобно визуализировать заполнение
    let score = 0;
    score += Math.min(60, symptomCount * 10);
    if (familyRisk) score += 25;
    if (severeResp) score += 15;
    return Math.max(0, Math.min(100, score));
  }, [symptomCount, familyRisk, severeResp]);

  const savePDF = () => window.print();
  const resetAll = () => {
    setData(DEFAULT);
    setStep("start");
  };

  const actions = [
    "Срочно направить к детскому неврологу.",
    "Назначить/рекомендовать молекулярно-генетическое тестирование (SMN1).",
    "Не откладывать направление (каждая неделя критична).",
    "Информировать родителей о необходимости срочного обследования.",
  ];

  const checked = useMemo(() => {
    const lines: Record<string, string[]> = {};

    lines["Семейный анамнез (красные флаги)"] = [
      data.famEarlyDeath ? "Случаи ранней детской смертности в семье (до 2 лет)" : "",
      data.famWeakness ? "Родственники с мышечной слабостью неясного генеза" : "",
      data.famConsanguinity ? "Родственные браки" : "",
      data.famSMN1Carrier ? "Известное носительство гена SMN1 у родителей" : "",
    ].filter(Boolean);

    lines["Двигательное развитие (0–6 мес)"] = [
      data.m0_head ? "Не удерживает голову к 3–4 мес" : "",
      data.m0_floppyLimbs ? "Вялые движения конечностей" : "",
      data.m0_frogPose ? "Редко двигает ногами («лягушачья поза»)" : "",
      data.m0_noRoll ? "Не переворачивается" : "",
    ].filter(Boolean);

    lines["Двигательное развитие (6–12 мес)"] = [
      data.m6_noSit ? "Не сидит самостоятельно" : "",
      data.m6_noStandSupport ? "Не встаёт у опоры" : "",
      data.m6_regression ? "Потеря ранее приобретённых навыков" : "",
    ].filter(Boolean);

    lines["Двигательное развитие (>12 мес)"] = [
      data.m12_noWalk ? "Не ходит самостоятельно" : "",
      data.m12_falls ? "Часто падает" : "",
      data.m12_hardRise ? "Трудно поднимается с пола" : "",
      data.m12_progressiveWeakness ? "Прогрессирующая мышечная слабость" : "",
    ].filter(Boolean);

    lines["Мышечный тонус и рефлексы"] = [
      data.tone_hypotonia ? "Выраженная мышечная гипотония" : "",
      data.tone_reflexLow ? "Снижение или отсутствие сухожильных рефлексов" : "",
      data.tone_proximalWeak ? "Преимущественно проксимальная мышечная слабость" : "",
    ].filter(Boolean);

    lines["Дыхание и кормление"] = [
      data.resp_paradox ? "Поверхностное или парадоксальное дыхание" : "",
      data.resp_accessory ? "Участие вспомогательной мускулатуры" : "",
      data.resp_infections ? "Частые респираторные инфекции" : "",
      data.feed_fatigue ? "Быстрая утомляемость при кормлении" : "",
      data.feed_chokeWeakCry ? "Попёрхивание, слабый крик" : "",
    ].filter(Boolean);

    lines["Осмотр"] = [
      data.exam_atrophy ? "Атрофия мышц (особенно плечевого и тазового пояса)" : "",
      data.exam_tongueFascic ? "Фасцикуляции языка" : "",
      data.exam_bellChest ? "Грудная клетка «колоколообразной» формы" : "",
      data.exam_contractures ? "Контрактуры / ограничение движений" : "",
    ].filter(Boolean);

    lines["Интеллект и чувствительность"] = [
      data.neuro_intellectPreserved ? "Интеллект сохранён" : "",
      data.neuro_sensationPreserved ? "Чувствительность не нарушена" : "",
    ].filter(Boolean);

    return lines;
  }, [data]);

  const patientLine = useMemo(() => {
    const aM = data.ageMonths.trim();
    const aY = data.ageYears.trim();
    const ageText =
      aM || aY ? `${aM ? `${aM} мес` : ""}${aM && aY ? " / " : ""}${aY ? `${aY} лет` : ""}` : "—";
    const sexText = data.sex === "m" ? "М" : data.sex === "f" ? "Ж" : "—";
    const gestText =
      data.gestation === "term"
        ? "Доношенный"
        : data.gestation === "preterm"
          ? `Недоношенный${data.pretermWeeks.trim() ? ` (${data.pretermWeeks.trim()} нед.)` : ""}`
          : "—";
    const pregText =
      data.pregnancyNoIssues === true ? "Да" : data.pregnancyNoIssues === false ? "Нет" : "—";
    return { ageText, sexText, gestText, pregText };
  }, [data]);

  return (
    <div className="min-h-screen w-full relative text-white flex flex-col" style={{ background: THEME.bg }}>
      <AuroraBG />

      <motion.header
        className="w-full px-8 py-6 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="h-10 w-10 grid place-items-center rounded-2xl shadow-lg"
            whileHover={{ rotate: -6, scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ background: "linear-gradient(135deg, #3D7BF7, #11A97D)" }}
          >
            <span className="text-xs font-bold">DNA</span>
          </motion.div>
          <div className="font-semibold" style={{ color: THEME.text }}>
            Электронный чек-лист ВОП — раннее выявление СМА
          </div>
        </div>

        <LanguageToggle />
      </motion.header>

      <main className="flex-1 w-full px-8 pb-24">
        <AnimatePresence mode="wait">
          {step === "start" && (
            <motion.section
              key="start"
              className="grid place-items-center py-14"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                className="w-full max-w-3xl rounded-3xl border backdrop-blur-xl shadow-2xl"
                style={{ background: THEME.panel, borderColor: THEME.border }}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="px-10 pt-12 pb-10 text-center">
                  <motion.div
                    className="mx-auto mb-6 h-24 w-24 rounded-3xl grid place-items-center"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    whileHover={{ rotate: 6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ClipboardCheck size={26} />
                  </motion.div>

                  <h1 className="text-3xl/tight font-semibold" style={{ color: THEME.text }}>
                    Раннее выявление спинальной мышечной атрофии (СМА)
                  </h1>
                  <p className="mt-3 text-base" style={{ color: THEME.muted }}>
                    Роль: врач общей практики (ВОП). Цель: заподозрить СМА на раннем этапе и своевременно направить к
                    детскому неврологу и на генетическое обследование.
                  </p>

                  <motion.button
                    onClick={() => setStep("form")}
                    className="mt-7 inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold shadow-lg"
                    style={{ background: "linear-gradient(90deg, #11A97D, #3D7BF7)" }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                  >
                    Начать заполнение
                  </motion.button>

                  <p className="mt-4 text-xs" style={{ color: THEME.muted }}>
                    Это скрининговый чек-лист для направления. Не заменяет консультацию специалиста и диагностику.
                  </p>
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === "form" && (
            <motion.section
              key="form"
              className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 py-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="grid gap-6">
                <div
                  className="rounded-3xl border p-6 backdrop-blur-xl shadow-xl"
                  style={{ background: THEME.panel, borderColor: THEME.border }}
                >
                  <motion.button
                    onClick={() => setStep("start")}
                    className="text-sm mb-3 inline-flex items-center gap-2"
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ color: THEME.muted }}
                  >
                    <ChevronLeft size={16} />
                    Назад
                  </motion.button>

                  <h2 className="text-2xl font-semibold" style={{ color: THEME.text }}>
                    Чек-лист (ВОП)
                  </h2>
                  <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                    Отметьте признаки. В конце получите итог и тактику направления.
                  </p>
                </div>

                <SectionCard title="1. Общие данные пациента">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SmallInput
                      label="Возраст ребёнка (месяцев)"
                      placeholder="например, 5"
                      value={data.ageMonths}
                      onChange={(v) => setData((p) => ({ ...p, ageMonths: v }))}
                    />
                    <SmallInput
                      label="Возраст ребёнка (лет)"
                      placeholder="например, 1"
                      value={data.ageYears}
                      onChange={(v) => setData((p) => ({ ...p, ageYears: v }))}
                    />
                    <TogglePill
                      label="Пол"
                      value={data.sex}
                      onChange={(v) => setData((p) => ({ ...p, sex: v as Sex }))}
                      options={[
                        { value: "m", title: "М" },
                        { value: "f", title: "Ж" },
                      ]}
                    />
                    <div className="grid gap-3">
                      <TogglePill
                        label="Доношенность"
                        value={data.gestation}
                        onChange={(v) => setData((p) => ({ ...p, gestation: v as Gestation }))}
                        options={[
                          { value: "term", title: "Доношенный" },
                          { value: "preterm", title: "Недоношенный" },
                        ]}
                      />
                      {data.gestation === "preterm" ? (
                        <SmallInput
                          label="Срок гестации (нед.)"
                          placeholder="например, 34"
                          value={data.pretermWeeks}
                          onChange={(v) => setData((p) => ({ ...p, pretermWeeks: v }))}
                          rightHint="если известно"
                        />
                      ) : null}
                    </div>

                    <TogglePill
                      label="Беременность и роды без особенностей"
                      value={
                        data.pregnancyNoIssues === null ? null : data.pregnancyNoIssues ? "yes" : "no"
                      }
                      onChange={(v) => setData((p) => ({ ...p, pregnancyNoIssues: v === "yes" }))}
                      options={[
                        { value: "yes", title: "Да" },
                        { value: "no", title: "Нет" },
                      ]}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="2. Семейный анамнез (красные флаги)"
                  subtitle="Отметьте «ДА», если присутствует хотя бы один пункт. Если ≥1 «ДА» → высокий риск СМА."
                >
                  <CheckRow
                    checked={data.famEarlyDeath}
                    onChange={(v) => setData((p) => ({ ...p, famEarlyDeath: v }))}
                    text="Случаи ранней детской смертности в семье (до 2 лет)"
                  />
                  <CheckRow
                    checked={data.famWeakness}
                    onChange={(v) => setData((p) => ({ ...p, famWeakness: v }))}
                    text="Родственники с мышечной слабостью неясного генеза"
                  />
                  <CheckRow
                    checked={data.famConsanguinity}
                    onChange={(v) => setData((p) => ({ ...p, famConsanguinity: v }))}
                    text="Родственные браки"
                  />
                  <CheckRow
                    checked={data.famSMN1Carrier}
                    onChange={(v) => setData((p) => ({ ...p, famSMN1Carrier: v }))}
                    text="Известное носительство гена SMN1 у родителей"
                  />
                </SectionCard>

                <SectionCard title="3. Двигательное развитие (ключевой блок)">
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold mt-1" style={{ color: THEME.text }}>
                      Для детей 0–6 месяцев
                    </div>
                    <CheckRow checked={data.m0_head} onChange={(v) => setData((p) => ({ ...p, m0_head: v }))} text="Не удерживает голову к 3–4 мес" />
                    <CheckRow checked={data.m0_floppyLimbs} onChange={(v) => setData((p) => ({ ...p, m0_floppyLimbs: v }))} text="Вялые движения конечностей" />
                    <CheckRow checked={data.m0_frogPose} onChange={(v) => setData((p) => ({ ...p, m0_frogPose: v }))} text="Редко двигает ногами («лягушачья поза»)" />
                    <CheckRow checked={data.m0_noRoll} onChange={(v) => setData((p) => ({ ...p, m0_noRoll: v }))} text="Не переворачивается" />

                    <div className="text-sm font-semibold mt-5" style={{ color: THEME.text }}>
                      Для детей 6–12 месяцев
                    </div>
                    <CheckRow checked={data.m6_noSit} onChange={(v) => setData((p) => ({ ...p, m6_noSit: v }))} text="Не сидит самостоятельно" />
                    <CheckRow checked={data.m6_noStandSupport} onChange={(v) => setData((p) => ({ ...p, m6_noStandSupport: v }))} text="Не встаёт у опоры" />
                    <CheckRow checked={data.m6_regression} onChange={(v) => setData((p) => ({ ...p, m6_regression: v }))} text="Потеря ранее приобретённых навыков" />

                    <div className="text-sm font-semibold mt-5" style={{ color: THEME.text }}>
                      Для детей старше 12 месяцев
                    </div>
                    <CheckRow checked={data.m12_noWalk} onChange={(v) => setData((p) => ({ ...p, m12_noWalk: v }))} text="Не ходит самостоятельно" />
                    <CheckRow checked={data.m12_falls} onChange={(v) => setData((p) => ({ ...p, m12_falls: v }))} text="Часто падает" />
                    <CheckRow checked={data.m12_hardRise} onChange={(v) => setData((p) => ({ ...p, m12_hardRise: v }))} text="Трудно поднимается с пола" />
                    <CheckRow checked={data.m12_progressiveWeakness} onChange={(v) => setData((p) => ({ ...p, m12_progressiveWeakness: v }))} text="Прогрессирующая мышечная слабость" />
                  </div>
                </SectionCard>

                <SectionCard title="4. Мышечный тонус и рефлексы">
                  <CheckRow checked={data.tone_hypotonia} onChange={(v) => setData((p) => ({ ...p, tone_hypotonia: v }))} text="Выраженная мышечная гипотония" />
                  <CheckRow checked={data.tone_reflexLow} onChange={(v) => setData((p) => ({ ...p, tone_reflexLow: v }))} text="Снижение или отсутствие сухожильных рефлексов" />
                  <CheckRow checked={data.tone_proximalWeak} onChange={(v) => setData((p) => ({ ...p, tone_proximalWeak: v }))} text="Преимущественно проксимальная мышечная слабость" />
                </SectionCard>

                <SectionCard title="5. Дыхание и кормление (очень важно)">
                  <CheckRow checked={data.resp_paradox} onChange={(v) => setData((p) => ({ ...p, resp_paradox: v }))} text="Поверхностное или парадоксальное дыхание" />
                  <CheckRow checked={data.resp_accessory} onChange={(v) => setData((p) => ({ ...p, resp_accessory: v }))} text="Участие вспомогательной мускулатуры" />
                  <CheckRow checked={data.resp_infections} onChange={(v) => setData((p) => ({ ...p, resp_infections: v }))} text="Частые респираторные инфекции" />
                  <CheckRow checked={data.feed_fatigue} onChange={(v) => setData((p) => ({ ...p, feed_fatigue: v }))} text="Быстрая утомляемость при кормлении" />
                  <CheckRow checked={data.feed_chokeWeakCry} onChange={(v) => setData((p) => ({ ...p, feed_chokeWeakCry: v }))} text="Попёрхивание, слабый крик" />
                </SectionCard>

                <SectionCard title="6. Осмотр">
                  <CheckRow checked={data.exam_atrophy} onChange={(v) => setData((p) => ({ ...p, exam_atrophy: v }))} text="Атрофия мышц (особенно плечевого и тазового пояса)" />
                  <CheckRow checked={data.exam_tongueFascic} onChange={(v) => setData((p) => ({ ...p, exam_tongueFascic: v }))} text="Фасцикуляции языка" />
                  <CheckRow checked={data.exam_bellChest} onChange={(v) => setData((p) => ({ ...p, exam_bellChest: v }))} text="Грудная клетка «колоколообразной» формы" />
                  <CheckRow checked={data.exam_contractures} onChange={(v) => setData((p) => ({ ...p, exam_contractures: v }))} text="Контрактуры / ограничение движений" />
                </SectionCard>

                <SectionCard title="7. Интеллект и чувствительность" subtitle="Сочетание выраженной мышечной слабости с сохранным интеллектом — характерный признак СМА.">
                  <CheckRow checked={data.neuro_intellectPreserved} onChange={(v) => setData((p) => ({ ...p, neuro_intellectPreserved: v }))} text="Интеллект сохранён" />
                  <CheckRow checked={data.neuro_sensationPreserved} onChange={(v) => setData((p) => ({ ...p, neuro_sensationPreserved: v }))} text="Чувствительность не нарушена" />
                </SectionCard>

                <div
                  className="rounded-3xl border p-6 backdrop-blur-xl shadow-xl"
                  style={{ background: THEME.panel, borderColor: THEME.border }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold" style={{ color: THEME.text }}>
                        8–9. Итог и тактика
                      </div>
                      <div className="text-sm mt-1" style={{ color: THEME.muted }}>
                        Нажмите «Сформировать итог», чтобы получить резюме и рекомендации.
                      </div>
                    </div>

                    <motion.button
                      onClick={() => setStep("result")}
                      className="rounded-full px-5 py-2.5 font-semibold shadow-lg"
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ y: -1 }}
                      style={{ background: "linear-gradient(90deg, #3D7BF7, #A047FF)", color: THEME.text }}
                    >
                      Сформировать итог
                    </motion.button>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <motion.button
                      onClick={() => setData(DEFAULT)}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold border"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ borderColor: THEME.border, color: THEME.text }}
                    >
                      <RotateCcw size={16} />
                      Сбросить
                    </motion.button>
                  </div>
                </div>
              </div>

              <div
                className="rounded-3xl border p-6 h-fit backdrop-blur-xl shadow-xl"
                style={{ background: THEME.panel, borderColor: THEME.border }}
              >
                <div className="text-sm font-medium" style={{ color: THEME.text }}>
                  Превью риска
                </div>
                <div className="mt-2 grid place-items-center">
                  <RiskMeter value={suspicionIndex} />
                </div>
                <p className="text-sm mt-1 text-center" style={{ color: THEME.muted }}>
                  Индекс — визуальная подсказка заполнения (не диагноз).
                </p>

                <div className="mt-4 grid gap-3">
                  <RiskBadge highPriority={highPriority} familyRisk={familyRisk} symptomCount={symptomCount} />
                  <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-sm" style={{ color: THEME.muted }}>
                      Быстрые правила
                    </div>
                    <div className="mt-2 text-sm leading-6" style={{ color: THEME.text }}>
                      • ≥1 семейный «красный флаг» → высокий риск
                      <br />• ≥2 симптома (разделы 3–6) → высокий приоритет
                      <br />• Дыхание/кормление «тяжёлые» признаки → высокий приоритет
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === "result" && (
            <motion.section
              key="result"
              className="py-8 print-area"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div
                className="rounded-3xl border p-6 backdrop-blur-xl shadow-2xl"
                style={{ background: THEME.panel, borderColor: THEME.border }}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="print-hide">
                    <motion.button
                      onClick={() => setStep("form")}
                      className="text-sm mb-2 inline-flex items-center gap-2"
                      whileHover={{ x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ color: THEME.muted }}
                    >
                      <ChevronLeft size={16} />
                      Назад к чек-листу
                    </motion.button>
                    <h2 className="text-2xl font-semibold" style={{ color: THEME.text }}>
                      Итог по чек-листу (ВОП)
                    </h2>
                    <p className="text-sm" style={{ color: THEME.muted }}>
                      Приоритет направления рассчитан по отмеченным пунктам.
                    </p>
                  </div>

                  <div className="grid place-items-center">
                    <RiskMeter value={suspicionIndex} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Stat label="Симптомов (разд. 3–6)" value={symptomCount} />
                  <Stat label="Семейный риск" value={familyRisk ? 1 : 0} suffix={familyRisk ? " (есть)" : " (нет)"} />
                  <Stat label="Приоритет" value={highPriority ? 1 : 0} suffix={highPriority ? " (ВЫСОКИЙ)" : " (наблюдение)"} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-sm font-medium" style={{ color: THEME.text }}>
                      Данные пациента
                    </div>
                    <div className="mt-2 text-sm leading-6" style={{ color: THEME.text }}>
                      • Возраст: {patientLine.ageText}
                      <br />• Пол: {patientLine.sexText}
                      <br />• Доношенность: {patientLine.gestText}
                      <br />• Беременность/роды без особенностей: {patientLine.pregText}
                    </div>
                  </div>

                  <ListBox title="Тактика врача ВОП" items={actions} />
                </div>

                <div className="mt-6 grid gap-4">
                  <RiskBadge highPriority={highPriority} familyRisk={familyRisk} symptomCount={symptomCount} />

                  <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-sm font-medium" style={{ color: THEME.text }}>
                      8. Оценка риска СМА (по чек-листу)
                    </div>
                    <div className="mt-2 text-sm leading-6" style={{ color: THEME.text }}>
                      • ≥2 симптома из разделов 3–6: <b>{symptomCount >= 2 ? "ДА" : "НЕТ"}</b>
                      <br />• + семейный анамнез (красные флаги): <b>{familyRisk ? "ДА" : "НЕТ"}</b>
                      <br />
                      <span style={{ color: THEME.muted }}>
                        Если отмечено ≥2 симптома и/или семейный риск — рассматривать как приоритетное направление.
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <CheckedList title="Отмеченные пункты" lines={Object.values(checked).flat()} />
                    <div className="grid gap-3">
                      <CheckedList title="Семейный анамнез" lines={checked["Семейный анамнез (красные флаги)"] || []} />
                      <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: "rgba(255,255,255,0.02)" }}>
                        <div className="text-sm font-medium" style={{ color: THEME.text }}>
                          Примечание
                        </div>
                        <p className="mt-2 text-sm leading-6" style={{ color: THEME.muted }}>
                          Чек-лист предназначен для раннего выявления и маршрутизации. Окончательная диагностика требует
                          осмотра детского невролога и молекулярно-генетического подтверждения (SMN1).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid gap-3">
                    <CheckedList title="3. Двигательное развитие (0–6 мес)" lines={checked["Двигательное развитие (0–6 мес)"] || []} />
                    <CheckedList title="3. Двигательное развитие (6–12 мес)" lines={checked["Двигательное развитие (6–12 мес)"] || []} />
                    <CheckedList title="3. Двигательное развитие (>12 мес)" lines={checked["Двигательное развитие (>12 мес)"] || []} />
                    <CheckedList title="4. Тонус и рефлексы" lines={checked["Мышечный тонус и рефлексы"] || []} />
                    <CheckedList title="5. Дыхание и кормление" lines={checked["Дыхание и кормление"] || []} />
                    <CheckedList title="6. Осмотр" lines={checked["Осмотр"] || []} />
                    <CheckedList title="7. Интеллект и чувствительность" lines={checked["Интеллект и чувствительность"] || []} />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 print-hide">
                  <motion.button
                    onClick={savePDF}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold shadow-lg"
                    whileTap={{ scale: 0.98 }}
                    style={{ background: "linear-gradient(90deg, #11A97D, #3D7BF7)", color: THEME.text }}
                  >
                    <Printer size={16} />
                    Сохранить / печать (PDF)
                  </motion.button>
                  <motion.button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold border"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ borderColor: THEME.border, color: THEME.text }}
                  >
                    <RotateCcw size={16} />
                    Заполнить заново
                  </motion.button>
                </div>

                <p className="mt-6 text-xs" style={{ color: THEME.muted }}>
                  Дисклеймер: чек-лист не является диагнозом. При подозрении на СМА требуется срочная маршрутизация к
                  детскому неврологу и генетическое подтверждение (SMN1).
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @page {
          size: A4;
          margin: 8mm 10mm 10mm;
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }

          header, footer, .print-hide, .aurora-print-hide { display: none !important; }

          main { padding: 0 !important; }
          .py-8 { padding-top: 0 !important; padding-bottom: 0 !important; }

          .print-area { margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }

          .print-area > .rounded-3xl {
            padding: 8mm 10mm !important;
            background: #fff !important;
            border: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;

            transform: scale(0.94);
            transform-origin: top center;
          }

          .print-area > .rounded-3xl > *:first-child { margin-top: 0 !important; }

          .mt-6 { margin-top: 8px !important; }
          .mb-3 { margin-bottom: 6px !important; }
          .gap-6 { gap: 12px !important; }
          .gap-4 { gap: 10px !important; }
          .rounded-2xl { padding: 10px !important; }
          .text-3xl { font-size: 22px !important; }
          .text-2xl { font-size: 18px !important; }
          .text-base { font-size: 12px !important; }
          .text-sm { font-size: 11px !important; }
          .leading-6 { line-height: 1.35 !important; }

          svg[aria-label="Индекс подозрения на СМА"] { width: 180px !important; height: 110px !important; }
        }
      `}</style>

      <footer
        className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs shadow-lg"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: `1px solid ${THEME.border}`,
          color: THEME.text,
          backdropFilter: "blur(8px)",
        }}
        aria-live="polite"
      >
        Использований: {usage === undefined ? "…" : usage}
      </footer>
    </div>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="text-sm" style={{ color: THEME.muted }}>
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold" style={{ color: THEME.text }}>
        {Math.round(value)}
        <span className="text-sm font-medium" style={{ color: THEME.muted }}>
          {suffix}
        </span>
      </div>
    </motion.div>
  );
}
