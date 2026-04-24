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
        "rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--gold-soft)]">
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
    neutral: "text-[var(--text-primary)]",
    up: "text-[var(--up)]",
    down: "text-[var(--down)]",
    warn: "text-[var(--gold-brand)]",
  }[tone];

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-3">
      <div className="text-[11px] tracking-[0.16em] text-[var(--text-muted)]">{label}</div>
      <div className={cx("mt-2 font-mono text-xl font-semibold", toneClasses)}>{value}</div>
      <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
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
    neutral: "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]",
    up: "border-[var(--up)]/20 bg-[var(--up)]/10 text-[var(--up)]",
    down: "border-[var(--down)]/20 bg-[var(--down)]/10 text-[var(--down)]",
    warn: "border-[var(--gold-brand)]/20 bg-[var(--gold-brand)]/10 text-[var(--gold-soft)]",
  }[tone];

  return (
    <span
      className={cx(
        "inline-flex items-center rounded border px-2.5 py-0.5 text-[11px] tracking-[0.1em]",
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
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-[0.02em] text-[var(--text-primary)]">{title}</h2>
        {detail ? (
          <p className="mt-1 max-w-xl text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PlainExplain({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border-gold)] bg-[var(--gold-brand)]/[0.04] p-4">
      <div className="text-[11px] tracking-[0.16em] text-[var(--gold-soft)]">大白话</div>
      <div className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">{title}</div>
      <p className="mt-1.5 text-xs leading-6 text-[var(--text-secondary)]">{children}</p>
    </div>
  );
}
