"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const navItems = [
  { href: "/", label: "观察列表", icon: "◉" },
  { href: "/symbol/MSTR", label: "标的详情", icon: "◈" },
];

function HeaderSummary() {
  return (
    <div className="hidden items-center gap-4 text-xs md:flex">
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--text-muted)]">数据源</span>
        <span className="font-mono font-medium text-[var(--gold-brand)]">Yahoo</span>
      </div>
      <div className="h-3 w-px bg-[var(--border-subtle)]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--text-muted)]">形态</span>
        <span className="font-mono font-medium text-[var(--text-primary)]">静态快照</span>
      </div>
      <div className="h-3 w-px bg-[var(--border-subtle)]" />
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--text-muted)]">模式</span>
        <span className="font-mono font-medium text-[var(--gold-soft)]">只读观察</span>
      </div>
    </div>
  );
}

function LayoutFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-base)] lg:flex">
        <div className="px-5 pb-4 pt-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold-muted)]">Night Shift</div>
          <Link href="/" className="mt-2 block font-serif text-2xl tracking-[0.06em] text-[var(--gold-brand)]">
            夜航期权
          </Link>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--gold-brand)]/10 text-[var(--gold-brand)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]",
                )}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 rounded-lg border border-[var(--border-gold)] bg-[var(--gold-brand)]/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--gold-muted)]">观察提示</div>
          <ul className="mt-2.5 space-y-1.5 text-[11px] leading-5 text-[var(--text-secondary)]">
            <li>· 先看流动性，再看波动结构。</li>
            <li>· 点差过大时，只把它当成流动性提醒。</li>
            <li>· 免费数据适合研究，不适合作为实时行情源。</li>
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-[var(--border-subtle)] px-4 py-2 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm text-[var(--gold-brand)]">夜航</span>
            <div className="flex gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(
                      "whitespace-nowrap rounded px-2.5 py-1.5 text-[11px] tracking-[0.1em] transition-colors",
                      active
                        ? "bg-[var(--gold-brand)]/10 text-[var(--gold-brand)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-3 md:px-6">
          <div className="text-xs font-medium text-[var(--text-secondary)] md:text-sm">先看报价、波动率和点差，再决定要不要继续研究。</div>
          <HeaderSummary />
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}

export function LayoutShell({ children }: { children: ReactNode }) {
  return <LayoutFrame>{children}</LayoutFrame>;
}
