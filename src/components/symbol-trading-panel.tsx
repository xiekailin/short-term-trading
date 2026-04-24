"use client";

import { useMemo, useState } from "react";
import { type QuoteData, type OptionChainData, type OptionContractData } from "@/lib/types";
import { calcSpread, calcDTE, formatExpDate } from "@/lib/format";
import { MetricCard, Panel, PlainExplain, SectionTitle, Tag } from "@/components/ui";

type SideFilter = "all" | "call" | "put";

type OptionSide = "call" | "put";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function formatDTEDisplay(expirationTimestamp: number): string {
  return `${calcDTE(expirationTimestamp)} DTE`;
}

function filterContracts(
  contracts: OptionContractData[],
  side: SideFilter | "never",
  price: number,
): OptionContractData[] {
  if (side === "never") return [];
  const lowerBound = price * 0.7;
  const upperBound = price * 1.3;

  return contracts
    .filter((c) => c.strike >= lowerBound && c.strike <= upperBound)
    .sort((a, b) => Math.abs(a.strike - price) - Math.abs(b.strike - price))
    .slice(0, 18);
}

function getOptionSide(contractSymbol: string): OptionSide {
  const match = contractSymbol.match(/\d{6}([CP])/);
  return match?.[1] === "P" ? "put" : "call";
}

function buildReadOnlyInfo(contract: OptionContractData, price: number, side: OptionSide) {
  const spread = calcSpread(contract.bid, contract.ask);
  const iv = `${(contract.impliedVolatility * 100).toFixed(1)}%`;
  const premium = contract.lastPrice > 0 ? `$${contract.lastPrice.toFixed(2)}` : "—";
  const isATM = Math.abs(contract.strike - price) / price < 0.03;
  const relation =
    isATM
      ? "ATM"
      : side === "call"
        ? contract.strike < price
          ? "ITM"
          : "OTM"
        : contract.strike > price
          ? "ITM"
          : "OTM";

  return {
    iv,
    spread,
    premium,
    relation,
    isATM,
    note:
      spread === "—"
        ? "Bid/Ask 数据不足，先观察成交量和 OI。"
        : Number.parseFloat(spread) > 8
          ? "点差偏大，只适合观察流动性。"
          : "点差还算正常，可以继续结合成交量和 OI 观察。",
  };
}

export function SymbolTradingPanel({
  ticker,
  quote,
  optionChain,
}: {
  ticker: string;
  quote: QuoteData;
  optionChain: OptionChainData;
}) {
  const [sideFilter, setSideFilter] = useState<SideFilter>("all");
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const expirations = useMemo(
    () =>
      [...new Set([...optionChain.calls, ...optionChain.puts].map((contract) => contract.expiration))]
        .filter((expiration) => calcDTE(expiration) >= 1)
        .sort((a, b) => a - b)
        .slice(0, 4),
    [optionChain.calls, optionChain.puts],
  );

  const currentExp = expirations[selectedExpIdx] ?? expirations[0];
  const calls = useMemo(
    () => filterContracts(optionChain.calls.filter((c) => c.expiration === currentExp), sideFilter === "put" ? "never" : sideFilter, quote.price),
    [optionChain.calls, currentExp, sideFilter, quote.price],
  );
  const puts = useMemo(
    () => filterContracts(optionChain.puts.filter((c) => c.expiration === currentExp), sideFilter === "call" ? "never" : sideFilter, quote.price),
    [optionChain.puts, currentExp, sideFilter, quote.price],
  );

  const visibleContracts = useMemo(
    () => (sideFilter === "put" ? puts : sideFilter === "call" ? calls : [...calls, ...puts]),
    [sideFilter, calls, puts],
  );

  const selectedContract = useMemo(
    () => visibleContracts.find((c) => c.contractSymbol === selectedSymbol) ?? null,
    [selectedSymbol, visibleContracts],
  );

  const selectedSide = selectedContract ? getOptionSide(selectedContract.contractSymbol) : null;
  const selectedInfo = selectedContract && selectedSide ? buildReadOnlyInfo(selectedContract, quote.price, selectedSide) : null;

  function handleExpChange(idx: number) {
    setSelectedExpIdx(idx);
    setSelectedSymbol(null);
  }

  function handleSideChange(side: SideFilter) {
    setSideFilter(side);
    setSelectedSymbol(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <Panel>
        <SectionTitle
          title="真实期权链"
          detail="先看流动性、点差、IV 和离现价远不远，再判断这张合约值不值得继续观察。"
          action={
            <div className="flex gap-1.5">
              {(["all", "call", "put"] as SideFilter[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => handleSideChange(side)}
                  className={cx(
                    "rounded border px-2.5 py-1 text-[11px] tracking-[0.1em] transition-colors",
                    sideFilter === side
                      ? "border-[var(--border-gold)] bg-[var(--gold-brand)]/10 text-[var(--gold-brand)]"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {side === "all" ? "全部" : side === "call" ? "Call" : "Put"}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {expirations.map((exp, idx) => (
            <button
              key={exp}
              type="button"
              onClick={() => handleExpChange(idx)}
              className={cx(
                "rounded border px-3 py-1.5 text-xs tracking-[0.1em] transition-colors",
                selectedExpIdx === idx
                  ? "border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)]"
                  : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {formatExpDate(exp)} ({formatDTEDisplay(exp)})
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">
                <th className="px-3 py-2 font-normal">类型</th>
                <th className="px-3 py-2 font-normal">Strike</th>
                <th className="px-3 py-2 font-normal">最新价</th>
                <th className="px-3 py-2 font-normal">Bid / Ask</th>
                <th className="px-3 py-2 font-normal">IV</th>
                <th className="px-3 py-2 font-normal">点差</th>
                <th className="px-3 py-2 font-normal">Vol / OI</th>
                <th className="px-3 py-2 font-normal">观察</th>
              </tr>
            </thead>
            <tbody>
              {visibleContracts.map((contract) => {
                const active = selectedContract?.contractSymbol === contract.contractSymbol;
                const side = getOptionSide(contract.contractSymbol);
                const isCall = side === "call";
                const iv = (contract.impliedVolatility * 100).toFixed(1);
                const spread = calcSpread(contract.bid, contract.ask);

                return (
                  <tr
                    key={contract.contractSymbol}
                    className={cx(
                      "border-b border-[var(--border-subtle)] text-sm transition-colors",
                      active ? "bg-[var(--gold-brand)]/[0.06]" : "hover:bg-[var(--surface-elevated)]",
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <Tag tone={isCall ? "up" : "down"}>{isCall ? "C" : "P"}</Tag>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[var(--text-primary)]">${contract.strike}</td>
                    <td className="px-3 py-2.5 font-mono text-[var(--text-primary)]">${contract.lastPrice.toFixed(2)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[var(--text-secondary)]">
                      ${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[var(--gold-soft)]">{iv}%</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-[var(--text-secondary)]">{spread}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">
                      {(contract.volume ?? 0).toLocaleString()} / {(contract.openInterest ?? 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSymbol(contract.contractSymbol)}
                        className={cx(
                          "rounded border px-2.5 py-1 text-[11px] transition-colors",
                          active
                            ? "border-[var(--border-gold)] bg-[var(--gold-brand)]/10 text-[var(--gold-brand)]"
                            : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                        )}
                      >
                        {active ? "正在看" : "看这张"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleContracts.length === 0 ? (
            <div className="py-4 text-xs text-[var(--text-muted)]">当前无匹配合约。</div>
          ) : null}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <SectionTitle title="观察面板" detail="这里集中解释合约结构、流动性和波动率。" />
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] px-4 py-3">
              <div className="text-[10px] tracking-[0.14em] text-[var(--text-muted)]">当前观察对象</div>
              <div className="mt-1 font-mono text-sm text-[var(--text-primary)]">
                {selectedContract ? selectedContract.contractSymbol : `先从左边选一张 ${ticker} 合约`}
              </div>
              {selectedInfo ? (
                <div className="mt-1 text-xs text-[var(--text-muted)]">
                  ${selectedContract!.strike} · {selectedSide === "call" ? "Call" : "Put"} · {selectedInfo.relation}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <MetricCard
                label="权利金"
                value={selectedInfo?.premium ?? "—"}
                detail="最新成交价只代表最近一笔，主要用来辅助观察。"
                tone="warn"
              />
              <MetricCard
                label="点差"
                value={selectedInfo?.spread ?? "—"}
                detail="点差越大，说明流动性越差，观察价值也会下降。"
                tone="up"
              />
              <MetricCard
                label="隐含波动率"
                value={selectedInfo?.iv ?? "—"}
                detail="IV 越高，说明这张期权定价越贵，对波动率变化也更敏感。"
                tone="warn"
              />
            </div>

            <PlainExplain title="这张该怎么看？">
              {selectedInfo?.note ?? "先选一张合约，再看它是 ATM、ITM 还是 OTM，以及点差和成交量是否健康。"}
            </PlainExplain>

            <PlainExplain title="为什么这里只提供观察？">
              这页的职责是先帮你看懂合约结构、点差和波动率，不替你做动作判断。
            </PlainExplain>

            <div className="rounded-lg border border-[var(--down)]/20 bg-[var(--down)]/[0.04] px-4 py-3 text-xs text-[var(--down)]">
              免费数据适合参考和观察，不适合作为高时效决策依据。它可能延迟、缺字段，也可能被限流。
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
