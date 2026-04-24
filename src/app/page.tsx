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
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>观察列表 / 静态快照</Eyebrow>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              当前版本部署在 GitHub Pages，展示最近一次生成的市场快照。数据源来自 Yahoo Finance，不是实时流。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="数据源" value="Yahoo" detail="仓库内静态快照" tone="warn" />
            <MetricCard label="快照时间" value={snapshotLabel} detail="不是实时行情" tone="up" />
            <MetricCard label="覆盖" value="3 个标的" detail="MSTR / CRCL / QQQ" />
          </div>
        </div>

        <SectionTitle
          title="今晚候选标的"
          detail="静态快照数据，点击进入详情页继续看期权链结构。"
          action={<div className="text-[11px] tracking-[0.16em] text-[var(--text-muted)]">{`${quotes.length} symbols · snapshot`}</div>}
        />

        <div className="space-y-3">
          {quotes.map((item) => {
            const isUp = item.changePercent >= 0;
            return (
              <Link key={item.symbol} href={`/symbol/${item.symbol.toLowerCase()}`}>
                <div className="group rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 transition-colors hover:border-[var(--border-gold)] hover:bg-[var(--surface-elevated)]">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-[200px] items-center gap-4">
                      <div className="min-w-0">
                        <div className="text-2xl font-serif tracking-[0.06em] text-[var(--text-primary)]">{item.symbol}</div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">{item.shortName}</div>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-xs ${
                          isUp ? "bg-[var(--up)]/10 text-[var(--up)]" : "bg-[var(--down)]/10 text-[var(--down)]"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {item.changePercent.toFixed(2)}%
                      </span>
                      <Tag tone={isUp ? "up" : "down"}>{isUp ? "偏强" : "偏弱"}</Tag>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm md:flex md:gap-6">
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">现价</div>
                        <div className="font-mono text-[var(--text-primary)]">{formatPrice(item.price)}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">涨跌</div>
                        <div className={`font-mono ${isUp ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                          {isUp ? "+" : ""}
                          {item.change.toFixed(2)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">成交量</div>
                        <div className="font-mono text-[var(--text-secondary)]">{formatVolume(item.volume)}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">日高/低</div>
                        <div className="font-mono text-[var(--text-secondary)]">
                          {formatPrice(item.dayHigh)} / {formatPrice(item.dayLow)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">52周范围</div>
                        <div className="font-mono text-[var(--text-muted)]">
                          {formatPrice(item.fiftyTwoWeekLow)} ~ {formatPrice(item.fiftyTwoWeekHigh)}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-[var(--gold-brand)] transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {quotes.length === 0 ? (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted)]">
              当前没有可显示的快照数据。
            </div>
          ) : null}
        </div>

        <PlainExplain title="这个页面是干嘛的？">
          先快速比较哪只标的最近一次快照里更活跃，再进详情页看期权链、到期日、点差和隐含波动率。
        </PlainExplain>
      </div>
    </LayoutShell>
  );
}
