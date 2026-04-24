"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { PlainExplain, Tag } from "@/components/ui";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const navItems = [
  { href: "/", label: "观察列表", code: "WATCH", match: "exact" },
  { href: "/symbol/mstr", label: "标的详情", code: "CHAIN", match: "symbol" },
];

function HeaderSummary() {
  const items = [
    { label: "SOURCE", value: "Yahoo", tone: "neutral" as const },
    { label: "SNAPSHOT", value: "静态", tone: "warn" as const },
    { label: "MODE", value: "只读观察", tone: "neutral" as const },
  ];

  return (
    <div className="hidden items-center gap-2 md:flex">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.025)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.12em] text-[var(--text-muted)]">{item.label}</span>
            <Tag tone={item.tone}>{item.value}</Tag>
          </div>
        </div>
      ))}
    </div>
  );
}

function LayoutFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_14%_0%,rgba(240,185,11,0.13),transparent_28%),radial-gradient(circle_at_96%_12%,rgba(240,185,11,0.065),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_36%),var(--surface-base)] text-[var(--text-primary)]">
      <aside className="hidden w-[224px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(240,185,11,0.055),rgba(255,255,255,0.012)_28%,transparent),var(--surface-press)] lg:flex">
        <div className="border-b border-[var(--border-subtle)] px-5 pb-5 pt-6">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--gold-muted)]">Night Options</div>
          <Link href="/" className="mt-2 block font-serif text-[2rem] leading-none tracking-[0.06em] text-[var(--gold-brand)]">
            夜航期权
          </Link>
          <p className="mt-3 text-[12px] leading-6 text-[var(--text-secondary)]">币安风黑金观察台，只看报价、波动率和期权链结构。</p>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = item.match === "exact" ? pathname === item.href : pathname.startsWith("/symbol/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "group flex items-center justify-between rounded-2xl border px-3 py-3 text-sm",
                  active
                    ? "border-[var(--border-gold)] bg-[linear-gradient(90deg,rgba(240,185,11,0.15),rgba(240,185,11,0.035)),var(--surface-panel)] text-[var(--gold-soft)] shadow-[var(--shadow-gold)]"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.025)] hover:text-[var(--text-primary)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cx("h-2 w-2 rounded-full", active ? "bg-[var(--gold-brand)] shadow-[0_0_14px_rgba(240,185,11,0.7)]" : "bg-[var(--border-strong)]")} />
                  <span>{item.label}</span>
                </div>
                <span className="font-mono text-[10px] text-[var(--text-muted)] group-hover:text-[var(--gold-muted)]">{item.code}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-4">
          <PlainExplain title="观察提示">
            免费数据可能延迟或缺字段。Actions 约每 10 分钟更新一次，打开中的页面需要手动刷新。
          </PlainExplain>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[var(--border-subtle)] bg-[rgba(8,11,15,0.92)] px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 font-serif text-base tracking-[0.1em] text-[var(--gold-brand)]">夜航</Link>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const active = item.match === "exact" ? pathname === item.href : pathname.startsWith("/symbol/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex min-h-10 items-center whitespace-nowrap rounded-xl border px-3.5 py-2 text-[11px] tracking-[0.08em]",
                      active
                        ? "border-[var(--border-gold)] bg-[rgba(240,185,11,0.12)] text-[var(--gold-soft)]"
                        : "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <header className="border-b border-[var(--border-subtle)] bg-[linear-gradient(90deg,rgba(240,185,11,0.09),transparent_30%),rgba(18,24,32,0.92)] px-5 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur md:px-6">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold-muted)]">terminal status</div>
              <div className="mt-1 text-xs font-medium tracking-[0.02em] text-[var(--text-secondary)] md:text-sm">
                约每 10 分钟生成一次静态快照：先筛标的，再看期权链流动性、点差和波动率。
              </div>
            </div>
            <HeaderSummary />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-5 md:px-6 md:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return <LayoutFrame>{children}</LayoutFrame>;
}
