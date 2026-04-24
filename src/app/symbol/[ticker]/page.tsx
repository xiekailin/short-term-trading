import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutShell } from "@/components/layout-shell";
import { SymbolTradingPanel } from "@/components/symbol-trading-panel";
import { MetricCard, PlainExplain, Tag } from "@/components/ui";
import { formatPrice, calcHV20, calcExpectedMove, calcDTE } from "@/lib/format";
import { SNAPSHOT_AT, getSnapshotChart, getSnapshotOptionChain, getSnapshotQuotes } from "@/lib/static-snapshot";

const VALID_TICKERS = ["MSTR", "CRCL", "QQQ"];

export const dynamicParams = false;

export function generateStaticParams() {
  return VALID_TICKERS.map((ticker) => ({ ticker: ticker.toLowerCase() }));
}

export default async function SymbolPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const upper = ticker.toUpperCase();

  if (!VALID_TICKERS.includes(upper)) {
    notFound();
  }

  const quote = getSnapshotQuotes([upper]).find((item) => item.symbol === upper);
  const options = getSnapshotOptionChain(upper);
  const chart = getSnapshotChart(upper);

  if (!quote) {
    notFound();
  }

  const isUp = quote.changePercent >= 0;
  const hv20 = calcHV20(chart.close);
  const contractExpirations = options
    ? [...new Set([...options.calls, ...options.puts].map((contract) => contract.expiration))].sort((a, b) => a - b)
    : [];
  const firstExp = contractExpirations[0];
  const dte = firstExp ? calcDTE(firstExp) : 0;
  const firstExpCalls = options?.calls.filter((contract) => contract.expiration === firstExp) ?? [];
  const firstExpStrikes = [...new Set(firstExpCalls.map((contract) => contract.strike))].sort((a, b) => a - b);
  const atmStrike = firstExpStrikes.find((strike) => strike >= quote.price) ?? 0;
  const atmCall = firstExpCalls.find((contract) => contract.strike === atmStrike);
  const atmIV = atmCall?.impliedVolatility ? `${(atmCall.impliedVolatility * 100).toFixed(1)}%` : "—";
  const expectedMove = calcExpectedMove(quote.price, atmCall?.impliedVolatility ?? 0, dte);
  const snapshotLabel = new Date(SNAPSHOT_AT).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <LayoutShell>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border-gold)] bg-[radial-gradient(circle_at_12%_0%,rgba(240,185,11,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.012)_42%,rgba(240,185,11,0.035)),var(--surface-card)] p-5 shadow-[var(--shadow-gold)] md:p-6">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(240,185,11,0.72),transparent)]" />
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Link href="/" className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.025)] px-3 py-2 text-[10px] font-semibold tracking-[0.12em] text-[var(--text-secondary)] hover:border-[var(--border-gold)] hover:text-[var(--gold-soft)]">
                ← 返回观察列表
              </Link>
              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
                <h1 className="font-serif text-6xl leading-none tracking-[0.06em] text-[var(--gold-soft)] md:text-7xl">{upper}</h1>
                <div className="pb-2">
                  <div className="text-sm text-[var(--text-secondary)]">{quote.shortName}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Tag tone="warn">快照</Tag>
                    <Tag>只读观察</Tag>
                    <Tag>Yahoo</Tag>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-[var(--border-subtle)] bg-[rgba(8,11,15,0.4)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">last price</div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div className="font-mono text-4xl font-semibold leading-none text-[var(--text-primary)]">{formatPrice(quote.price)}</div>
                <div className={`font-mono text-sm ${isUp ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
                  {isUp ? "+" : ""}
                  {quote.change.toFixed(2)} / {isUp ? "+" : ""}
                  {quote.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 font-mono text-[11px] text-[var(--text-muted)]">snapshot · {snapshotLabel}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="现价" value={formatPrice(quote.price)} detail={`前收 ${formatPrice(quote.previousClose)}`} tone={isUp ? "up" : "down"} />
          <MetricCard label="ATM IV" value={atmIV} detail="最近一期 ATM Call 隐含波动率" tone="warn" />
          <MetricCard label="HV20" value={hv20} detail="按快照收盘价序列估算" />
          <MetricCard label="Expected Move" value={expectedMove} detail={`${dte} DTE · ATM IV 估算`} tone="warn" />
        </div>

        <PlainExplain title="进入期权链前先记住">
          下面的数据只帮你观察合约结构。快照约每 10 分钟由 GitHub Actions 更新一次；已打开页面需要手动刷新。
        </PlainExplain>

        {options ? (
          <SymbolTradingPanel ticker={upper} quote={quote} optionChain={options} />
        ) : (
          <PlainExplain title="期权链数据暂不可用">当前快照里没有这个标的的期权链数据。</PlainExplain>
        )}
      </div>
    </LayoutShell>
  );
}
