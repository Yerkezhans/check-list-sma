"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake, Sparkles, Languages } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
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

type Status = "healthy" | "carrier" | "affected" | "unknown";

type Risk = {
  sma: number;
  carrier: number;
  healthy: number;
  summary: string;
  advice: string[];
};

const URL_RE = /https?:\/\/[^\s)]+/g;
function linkify(text: string) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = URL_RE.exec(text)) !== null) {
    const url = match[0];
    const start = match.index;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <a
        key={`${url}-${start}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:no-underline"
        style={{ color: THEME.text }}
      >
        {url}
      </a>
    );
    lastIndex = start + url.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Risk из словаря переводов */
function buildRisk(a: Status, b: Status, t: ReturnType<typeof useTranslations>): Risk {
  if (a === "unknown" || b === "unknown") {
    return {
      sma: 0,
      carrier: 0,
      healthy: 0,
      summary: t("risk.unknown.summary"),
      advice: t.raw("risk.unknown.advice") as string[],
    };
  }

  const pair = [a, b].sort().join("_") as
    | "affected_affected"
    | "affected_carrier"
    | "affected_healthy"
    | "carrier_carrier"
    | "carrier_healthy"
    | "healthy_healthy";

  switch (pair) {
    case "affected_affected":
      return {
        sma: 100,
        carrier: 0,
        healthy: 0,
        summary: t("risk.affected_affected.summary"),
        advice: t.raw("risk.affected_affected.advice") as string[],
      };
    case "affected_carrier":
      return {
        sma: 50,
        carrier: 50,
        healthy: 0,
        summary: t("risk.affected_carrier.summary"),
        advice: t.raw("risk.affected_carrier.advice") as string[],
      };
    case "affected_healthy":
      return {
        sma: 0,
        carrier: 100,
        healthy: 0,
        summary: t("risk.affected_healthy.summary"),
        advice: t.raw("risk.affected_healthy.advice") as string[],
      };
    case "carrier_carrier":
      return {
        sma: 25,
        carrier: 50,
        healthy: 25,
        summary: t("risk.carrier_carrier.summary"),
        advice: t.raw("risk.carrier_carrier.advice") as string[],
      };
    case "carrier_healthy":
      return {
        sma: 0,
        carrier: 50,
        healthy: 50,
        summary: t("risk.carrier_healthy.summary"),
        advice: t.raw("risk.carrier_healthy.advice") as string[],
      };
    case "healthy_healthy":
      return {
        sma: 0,
        carrier: 0,
        healthy: 100,
        summary: t("risk.healthy_healthy.summary"),
        advice: t.raw("risk.healthy_healthy.advice") as string[],
      };
    default:
      return {
        sma: 0,
        carrier: 0,
        healthy: 0,
        summary: t("risk.default.summary"),
        advice: t.raw("risk.default.advice") as string[],
      };
  }
}

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

function Donut({ value }: { value: number }) {
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
      aria-label="Риск СМА"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
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
        stroke="url(#g)"
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
        fontSize={36}
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

function PairRecommendations({ me, partner }: { me: Status | null; partner: Status | null }) {
  const a = (me ?? "unknown") as Status;
  const b = (partner ?? "unknown") as Status;

  const key =
    a === "unknown" || b === "unknown"
      ? "unknown"
      : ([a, b].sort().join("_") as
          | "affected_affected"
          | "affected_carrier"
          | "affected_healthy"
          | "carrier_carrier"
          | "carrier_healthy");

  const tPair = useTranslations("pair");

  const title = tPair(`${key}.title`);
  const bullets = tPair.raw(`${key}.bullets`) as string[];

  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow"
          style={{
            background: "linear-gradient(90deg, rgba(17,169,125,0.18), rgba(61,123,247,0.18))",
            color: THEME.text,
          }}
        >
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -8, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="grid place-items-center"
          >
            <HeartHandshake size={16} />
          </motion.span>
          {tPair("header")}
        </span>
      </div>

      <div className="text-sm font-medium mb-3" style={{ color: THEME.text }}>
        {title}
      </div>

      <ul className="grid gap-2">
        {bullets.map((line, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3 rounded-xl px-3 py-2"
            whileHover={{ y: -1 }}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span
              className="mt-0.5 shrink-0 rounded-full p-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <Sparkles size={16} />
            </span>
            <span className="text-sm leading-6" style={{ color: THEME.text }}>
              {linkify(line)}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}


export default function SMAAppV6() {
  const t = useTranslations();

  const [step, setStep] = useState<"start" | "form" | "result">("start");
  const [me, setMe] = useState<Status | null>(null);
  const [partner, setPartner] = useState<Status | null>(null);

  const risk = useMemo(() => {
    return buildRisk((me ?? "unknown") as Status, (partner ?? "unknown") as Status, t);
  }, [me, partner, t]);

  const [usage, setUsage] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeUsageCount(setUsage);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (step === "result") incrementUsageOncePerSession();
  }, [step]);

  const savePDF = () => window.print();
  const resetAll = () => {
    setMe(null);
    setPartner(null);
    setStep("start");
  };

  const globalAdvice = t.raw("advice") as string[];

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
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            style={{ background: "linear-gradient(135deg, #3D7BF7, #11A97D)" }}
          >
            <span className="text-xs font-bold">DNA</span>
          </motion.div>
          <div className="font-semibold" style={{ color: THEME.text }}>
            {t("app.title")}
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
                  >
                    <span className="font-bold tracking-wider" style={{ color: THEME.text }}>
                      DNA
                    </span>
                  </motion.div>
                  <h1 className="text-3xl/tight font-semibold" style={{ color: THEME.text }}>
                    {t("app.title")}
                  </h1>
                  <p className="mt-3 text-base" style={{ color: THEME.muted }}>
                    {t("app.subtitle")}
                  </p>
                  <motion.button
                    onClick={() => setStep("form")}
                    className="mt-7 inline-flex items-center justify-center rounded-full px-7 py-3 font-semibold shadow-lg"
                    style={{ background: "linear-gradient(90deg, #11A97D, #3D7BF7)" }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                  >
                    {t("ui.start")}
                  </motion.button>
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
              <div
                className="rounded-3xl border p-6 backdrop-blur-xl shadow-xl"
                style={{ background: THEME.panel, borderColor: THEME.border }}
              >
                <motion.button
                  onClick={() => setStep("start")}
                  className="text-sm mb-3"
                  whileHover={{ x: -2 }}
                  style={{ color: THEME.muted }}
                >
                  {t("ui.back")}
                </motion.button>
                <h2 className="text-2xl font-semibold" style={{ color: THEME.text }}>
                  {t("ui.data")}
                </h2>
                <p className="text-sm mt-1" style={{ color: THEME.muted }}>
                  {t("ui.choose")}
                </p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <FieldGroup label={t("fields.you")} value={me} onChange={setMe} />
                  <FieldGroup label={t("fields.partner")} value={partner} onChange={setPartner} />
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <motion.button
                    onClick={() => setStep("result")}
                    disabled={!me || !partner}
                    className="rounded-full px-6 py-3 font-semibold disabled:opacity-50"
                    style={{
                      background: "linear-gradient(90deg, #3D7BF7, #A047FF)",
                      color: THEME.text,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("ui.calc")}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setMe(null);
                      setPartner(null);
                    }}
                    className="text-sm"
                    whileHover={{ scale: 1.02 }}
                    style={{ color: THEME.muted }}
                  >
                    {t("ui.reset")}
                  </motion.button>
                </div>
              </div>

              <div
                className="rounded-3xl border p-6 h-fit backdrop-blur-xl shadow-xl"
                style={{ background: THEME.panel, borderColor: THEME.border }}
              >
                <div className="text-sm font-medium" style={{ color: THEME.text }}>
                  {t("ui.preview")}
                </div>
                <div className="mt-2 grid place-items-center">
                  <Donut value={risk.sma} />
                </div>
                <p className="text-sm mt-1 text-center" style={{ color: THEME.muted }}>
                  {t("ui.draftRisk")}
                </p>
                <p className="mt-3 text-sm leading-6" style={{ color: THEME.text }}>
                  {risk.summary}
                </p>
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
              <div className="rounded-3xl border p-6 backdrop-blur-xl shadow-2xl" style={{ background: THEME.panel, borderColor: THEME.border }}>
                <div className="flex items-start justify-between gap-6">
                  <div className="print-hide">
                    <motion.button
                      onClick={() => setStep("form")}
                      className="text-sm mb-2"
                      whileHover={{ x: -2 }}
                      style={{ color: THEME.muted }}
                    >
                      {t("ui.back")}
                    </motion.button>
                    <h2 className="text-2xl font-semibold" style={{ color: THEME.text }}>
                      {t("ui.result")}
                    </h2>
                    <p className="text-sm" style={{ color: THEME.muted }}>
                      {t("ui.resultNote")}
                    </p>
                  </div>
                  <Donut value={risk.sma} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <StatCard label={t("stats.riskSMA")} value={risk.sma} suffix="%" />
                  {risk.carrier > 0 && <StatCard label={t("stats.carrier")} value={risk.carrier} suffix="%" />}
                  {risk.healthy > 0 && <StatCard label={t("stats.healthy")} value={risk.healthy} suffix="%" />}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoCard title={t("stats.whatItMeans")} text={risk.summary} />
                  <CuteTips items={globalAdvice} />
                </div>

                <div className="mt-6">
                  <PairRecommendations me={me ?? "unknown"} partner={partner ?? "unknown"} />
                </div>

                <div className="mt-6 flex gap-3 print-hide">
                  <motion.button
                    onClick={savePDF}
                    className="rounded-full px-5 py-2.5 font-semibold shadow-lg"
                    whileTap={{ scale: 0.98 }}
                    style={{ background: "linear-gradient(90deg, #11A97D, #3D7BF7)", color: THEME.text }}
                  >
                    {t("ui.save")}
                  </motion.button>
                  <motion.button
                    onClick={resetAll}
                    className="rounded-full px-5 py-2.5 font-semibold border"
                    whileHover={{ scale: 1.02 }}
                    style={{ borderColor: THEME.border, color: THEME.text }}
                  >
                    {t("ui.again")}
                  </motion.button>
                </div>

                <p className="mt-6 text-xs" style={{ color: THEME.muted }}>
                  {t("stats.disclaimer")}
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

        <style>{`
          @page {
            size: A4;
            margin: 8mm 10mm 10mm; /* меньше верхнее поле */
          }

          @media print {
            html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }

            /* прячем всё лишнее */
            header, footer, .print-hide, .aurora-print-hide { display: none !important; }

            main { padding: 0 !important; }
            .py-8 { padding-top: 0 !important; padding-bottom: 0 !important; }

            /* сама печатная область без лишних полей/теней */
            .print-area { margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }

            /* главный контейнер результата — компактный и «поджат» вверх */
            .print-area > .rounded-3xl {
              padding: 8mm 10mm !important;
              background: #fff !important;
              border: none !important;
              box-shadow: none !important;
              backdrop-filter: none !important;

              /* уменьшаем содержимое, чтобы влезло на 1 страницу */
              transform: scale(0.94);
              transform-origin: top center;
            }

            /* убираем любые «первые» внешние отступы сверху */
            .print-area > .rounded-3xl > *:first-child { margin-top: 0 !important; }

            /* компактнее отступы/шрифты, чтобы точно поместилось */
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

            /* понемногу уменьшаем пончик */
            svg[aria-label="Риск СМА"] { width: 180px !important; height: 110px !important; }
          }
        `}</style>


      <footer
        className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs shadow-lg"
        style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.border}`, color: THEME.text, backdropFilter: "blur(8px)" }}
        aria-live="polite"
      >
        {t("ui.used")}: {usage === undefined ? "…" : usage}
      </footer>
    </div>
  );
}

function FieldGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Status | null;
  onChange: (v: Status) => void;
}) {
  const t = useTranslations();
  const OPTIONS: readonly { value: Status }[] = [
    { value: "healthy" },
    { value: "carrier" },
    { value: "affected" },
    { value: "unknown" },
  ] as const;

  return (
    <div>
      <div className="text-sm font-medium" style={{ color: THEME.text }}>
        {label}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <motion.label
            key={o.value}
            className="rounded-2xl border px-3 py-2.5 cursor-pointer select-none text-sm"
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
            <input
              type="radio"
              className="sr-only"
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span>{t(`status.${o.value}`)}</span>
          </motion.label>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
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
        {suffix}
      </div>
    </motion.div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
    >
      <div className="text-sm font-medium" style={{ color: THEME.text }}>
        {title}
      </div>
      <p className="mt-2 text-sm leading-6" style={{ color: THEME.text }}>
        {text}
      </p>
    </motion.div>
  );
}

function CuteTips({ items }: { items: string[] }) {
  const t = useTranslations();
  return (
    <motion.div
      className="rounded-2xl border p-5 backdrop-blur-xl"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: THEME.panel, borderColor: THEME.border }}
      aria-label={t("stats.tips")}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow"
          style={{ background: "linear-gradient(90deg, rgba(17,169,125,0.18), rgba(61,123,247,0.18))", color: THEME.text }}
        >
          <motion.span
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -8, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="grid place-items-center"
          >
            <HeartHandshake size={16} />
          </motion.span>
          {t("stats.tips")}
        </span>
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((txt, i) => (
          <motion.li
            key={i}
            className="flex items-start gap-3 rounded-xl px-3 py-2"
            whileHover={{ y: -1 }}
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span className="mt-0.5 shrink-0 rounded-full p-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              <Sparkles size={16} />
            </span>
            <span className="text-sm leading-6" style={{ color: THEME.text }}>
              {linkify(txt)}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
