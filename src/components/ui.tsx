import { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "relative overflow-hidden rounded-[1.35rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012)),var(--surface-card)] p-5 shadow-[var(--shadow-panel)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(240,185,11,0.45),transparent)] before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(240,185,11,0.04),transparent_34%)] after:content-['']",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-soft)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold-brand)] shadow-[0_0_14px_rgba(240,185,11,0.8)]" />
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "up" | "down" | "warn";
}) {
  const toneClasses = {
    neutral: {
      value: "text-[var(--text-primary)]",
      rail: "bg-[var(--border-strong)]",
      border: "border-[var(--border-subtle)]",
      glow: "",
    },
    up: {
      value: "text-[var(--up)]",
      rail: "bg-[var(--up)]",
      border: "border-[rgba(14,203,129,0.22)]",
      glow: "shadow-[inset_3px_0_0_rgba(14,203,129,0.75)]",
    },
    down: {
      value: "text-[var(--down)]",
      rail: "bg-[var(--down)]",
      border: "border-[rgba(246,70,93,0.22)]",
      glow: "shadow-[inset_3px_0_0_rgba(246,70,93,0.75)]",
    },
    warn: {
      value: "text-[var(--gold-soft)]",
      rail: "bg-[var(--gold-brand)]",
      border: "border-[var(--border-gold)]",
      glow: "shadow-[inset_3px_0_0_rgba(240,185,11,0.8)]",
    },
  }[tone];

  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.01)),var(--surface-panel)] px-4 py-3.5",
        toneClasses.border,
        toneClasses.glow,
      )}
    >
      <div className={cx("absolute inset-x-0 top-0 h-px opacity-80", toneClasses.rail)} />
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-secondary)]">{label}</div>
      <div className={cx("mt-2 font-mono text-[1.42rem] font-semibold leading-none tracking-[-0.02em]", toneClasses.value)}>{value}</div>
      <p className="mt-2 text-[12px] leading-5 text-[var(--text-muted)]">{detail}</p>
    </div>
  );
}

export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "up" | "down" | "warn";
}) {
  const toneClasses = {
    neutral: "border-[var(--border-strong)] bg-[rgba(255,255,255,0.045)] text-[var(--text-secondary)]",
    up: "border-[rgba(14,203,129,0.28)] bg-[rgba(14,203,129,0.1)] text-[var(--up)]",
    down: "border-[rgba(246,70,93,0.3)] bg-[rgba(246,70,93,0.1)] text-[var(--down)]",
    warn: "border-[var(--border-gold)] bg-[rgba(240,185,11,0.11)] text-[var(--gold-soft)]",
  }[tone];

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        toneClasses,
      )}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-2 h-1 w-10 rounded-full bg-[var(--gold-brand)]" />
        <h2 className="text-lg font-semibold tracking-[0.02em] text-[var(--text-primary)]">{title}</h2>
        {detail ? <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-[var(--text-secondary)]">{detail}</p> : null}
      </div>
      {action ? <div className="md:pb-1">{action}</div> : null}
    </div>
  );
}

export function PlainExplain({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(240,185,11,0.07),rgba(255,255,255,0.012)_42%,transparent),var(--surface-panel)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-[rgba(240,185,11,0.68)]" />
      <div className="pl-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-soft)]">观察注释</div>
        <div className="mt-2 text-[13px] font-semibold tracking-[0.02em] text-[var(--text-primary)]">{title}</div>
        <p className="mt-2 text-[12px] leading-6 text-[var(--text-secondary)]">{children}</p>
      </div>
    </div>
  );
}
