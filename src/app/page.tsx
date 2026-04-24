import Link from "next/link";
import { LayoutShell } from "@/components/layout-shell";
import { Eyebrow, MetricCard, PlainExplain, SectionTitle, Tag } from "@/components/ui";
import { formatPrice, formatVolume } from "@/lib/format";
import { SNAPSHOT_AT, getSnapshotQuotes } from "@/lib/static-snapshot";

const SYMBOLS = ["MSTR", "CRCL", "QQQ"];

export default function HomePage() {
  const quotes = getSnapshotQuotes(SYMBOLS);
  const snapshotLabel = new Date(SNAPSHOT_AT).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <LayoutShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border-gold)] bg-[radial-gradient(circle_at_12%_0%,rgba(240,185,11,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.012)_38%,rgba(240,185,11,0.035)),var(--surface-card)] p-5 shadow-[var(--shadow-gold)] md:p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,185,11,0.72),transparent)]" />
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div>
              <Eyebrow>snapshot console</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl leading-none tracking-[0.04em] text-[var(--text-primary)] md:text-5xl">
                美股期权观察台
              </h1>
              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-[var(--text-secondary)]">
                基于 GitHub Actions 约每 10 分钟生成的静态快照，先比较标的强弱和成交活跃度，再进入期权链观察 IV、点差和流动性。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag tone="warn">非实时</Tag>
                <Tag>只读观察</Tag>
                <Tag>不做交易建议</Tag>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="数据源" value="Yahoo" detail="Actions 定时生成" tone="warn" />
              <MetricCard label="快照时间" value={snapshotLabel} detail="约 10 分钟刷新一次" />
              <MetricCard label="覆盖标的" value={`${quotes.length}`} detail="MSTR / CRCL / QQQ" />
            </div>
          </div>
        </section>

        <SectionTitle
          title="今晚候选标的"
          detail="像看交易清单一样先扫价格、涨跌、成交量和区间，再进入详情页看期权链结构。"
          action={
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.025)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--gold-muted)]">
              {`${quotes.length} symbols · static snapshot`}
            </div>
          }
        />

        <div className="overflow-hidden rounded-[1.35rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01)),var(--surface-card)] shadow-[var(--shadow-panel)]">
          <div className="hidden grid-cols-[1.1fr_0.7fr_0.7fr_0.75fr_0.85fr_1fr_96px] border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.025)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:grid">
            <div>Symbol</div>
            <div>Price</div>
            <div>Change</div>
            <div>Volume</div>
            <div>Day Range</div>
            <div>52W Range</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {quotes.map((item) => {
              const isUp = item.changePercent >= 0;
              return (
                <Link
                  key={item.symbol}
                  href={`/symbol/${item.symbol.toLowerCase()}`}
                  className="group block px-4 py-4 hover:bg-[rgba(240,185,11,0.045)] focus-visible:bg-[rgba(240,185,11,0.07)]"
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_0.7fr_0.7fr_0.75fr_0.85fr_1fr_96px] xl:items-center">
                    <div className="flex min-w-0 items-center justify-between gap-3 md:col-span-2 xl:col-span-1 xl:block">
                      <div>
                        <div className="font-serif text-3xl leading-none tracking-[0.08em] text-[var(--gold-soft)] xl:text-2xl">{item.symbol}</div>
                        <div className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{item.shortName}</div>
                      </div>
                      <Tag tone={isUp ? "up" : "down"}>{isUp ? "偏强" : "偏弱"}</Tag>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:hidden">现价</div>
                      <div className="mt-1 font-mono text-[16px] text-[var(--text-primary)]">{formatPrice(item.price)}</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:hidden">涨跌</div>
                      <div className={`mt-1 font-mono text-[15px] ${isUp ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                        {isUp ? "+" : ""}
                        {item.change.toFixed(2)} / {isUp ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:hidden">成交量</div>
                      <div className="mt-1 font-mono text-[14px] text-[var(--text-secondary)]">{formatVolume(item.volume)}</div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:hidden">日高 / 低</div>
                      <div className="mt-1 font-mono text-[13px] text-[var(--text-secondary)]">
                        {formatPrice(item.dayHigh)} / {formatPrice(item.dayLow)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)] xl:hidden">52 周范围</div>
                      <div className="mt-1 font-mono text-[13px] text-[var(--text-muted)]">
                        {formatPrice(item.fiftyTwoWeekLow)} ~ {formatPrice(item.fiftyTwoWeekHigh)}
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <span className="rounded-xl border border-[var(--border-gold)] bg-[rgba(240,185,11,0.09)] px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--gold-soft)] group-hover:bg-[rgba(240,185,11,0.14)]">
                        进入观察
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-panel)]">
            当前没有可显示的快照数据。
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <PlainExplain title="第一步：先扫标的">
            看价格变化和成交量，判断哪只股票更值得进入详情页继续观察。
          </PlainExplain>
          <PlainExplain title="第二步：再看期权链">
            重点看 ATM 附近的 IV、成交量、OI 和 Bid/Ask 点差，不只看最新价。
          </PlainExplain>
          <PlainExplain title="第三步：只做研究">
            当前页面会随 GitHub Actions 定时部署更新；已打开的页面需要手动刷新，仍不适合作为高时效交易依据。
          </PlainExplain>
        </div>
      </div>
    </LayoutShell>
  );
}
