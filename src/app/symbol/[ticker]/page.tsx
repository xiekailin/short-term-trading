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
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
              观察列表
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="font-serif text-2xl tracking-[0.06em] text-[var(--text-primary)]">{upper}</span>
            <span className="text-sm text-[var(--text-muted)]">{quote.shortName}</span>
            <span className="font-mono text-lg text-[var(--text-primary)]">{formatPrice(quote.price)}</span>
            <span className={`font-mono text-sm ${isUp ? "text-[var(--up)]" : "text-[var(--down)]"}`}>
              {isUp ? "+" : ""}
              {quote.change.toFixed(2)} ({isUp ? "+" : ""}
              {quote.changePercent.toFixed(2)}%)
            </span>
            <Tag tone="warn">快照</Tag>
          </div>
          <div className="text-xs text-[var(--text-muted)]">最近一次生成：{snapshotLabel}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="现价" value={formatPrice(quote.price)} detail={`前收 ${formatPrice(quote.previousClose)}`} tone={isUp ? "up" : "down"} />
          <MetricCard label="ATM IV" value={atmIV} detail="最近一期 ATM Call 隐含波动率" tone="warn" />
          <MetricCard label="HV20" value={hv20} detail="按快照收盘价序列估算" />
          <MetricCard label="Expected Move" value={expectedMove} detail={`${dte} DTE · ATM IV 估算`} tone="up" />
        </div>

        {options ? (
          <SymbolTradingPanel ticker={upper} quote={quote} optionChain={options} />
        ) : (
          <PlainExplain title="期权链数据暂不可用">当前快照里没有这个标的的期权链数据。</PlainExplain>
        )}
      </div>
    </LayoutShell>
  );
}
