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

function toneForSpread(spread: string) {
  if (spread === "—") return "neutral";
  const numeric = Number.parseFloat(spread);
  if (numeric <= 4) return "up";
  if (numeric <= 8) return "warn";
  return "down";
}

function spreadPillClass(spread: string) {
  const tone = toneForSpread(spread);
  if (tone === "up") return "border-[rgba(14,203,129,0.28)] bg-[rgba(14,203,129,0.1)] text-[var(--up)]";
  if (tone === "warn") return "border-[var(--border-gold)] bg-[rgba(240,185,11,0.11)] text-[var(--gold-soft)]";
  if (tone === "down") return "border-[rgba(246,70,93,0.3)] bg-[rgba(246,70,93,0.1)] text-[var(--down)]";
  return "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]";
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_420px]">
      <Panel>
        <SectionTitle
          title="期权链工作区"
          detail="围绕现价附近筛选合约，重点观察点差、成交量、OI 和隐含波动率。"
          action={
            <div role="group" aria-label="合约类型筛选" className="inline-flex rounded-xl border border-[var(--border-strong)] bg-[var(--surface-press)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {(["all", "call", "put"] as SideFilter[]).map((side) => (
                <button
                  key={side}
                  type="button"
                  aria-pressed={sideFilter === side}
                  onClick={() => handleSideChange(side)}
                  className={cx(
                    "rounded-lg px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                    sideFilter === side
                      ? side === "call"
                        ? "bg-[rgba(14,203,129,0.13)] text-[var(--up)]"
                        : side === "put"
                          ? "bg-[rgba(246,70,93,0.13)] text-[var(--down)]"
                          : "bg-[rgba(240,185,11,0.14)] text-[var(--gold-soft)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {side === "all" ? "ALL" : side.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />

        <div className="mt-4 grid gap-2 border-b border-[var(--border-subtle)] pb-4 sm:grid-cols-2 lg:grid-cols-4">
          {expirations.map((exp, idx) => (
            <button
              key={exp}
              type="button"
              aria-pressed={selectedExpIdx === idx}
              onClick={() => handleExpChange(idx)}
              className={cx(
                "rounded-2xl border px-3.5 py-3 text-left",
                selectedExpIdx === idx
                  ? "border-[var(--border-gold)] bg-[linear-gradient(180deg,rgba(240,185,11,0.13),rgba(240,185,11,0.04)),var(--surface-panel)] text-[var(--gold-soft)] shadow-[var(--shadow-gold)]"
                  : "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.018)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.03)]",
              )}
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.14em]">{formatExpDate(exp)}</div>
              <div className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">{formatDTEDisplay(exp)}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {visibleContracts.map((contract) => {
            const active = selectedContract?.contractSymbol === contract.contractSymbol;
            const side = getOptionSide(contract.contractSymbol);
            const isCall = side === "call";
            const spread = calcSpread(contract.bid, contract.ask);
            const nearAtm = Math.abs(contract.strike - quote.price) / quote.price < 0.03;

            return (
              <button
                key={contract.contractSymbol}
                type="button"
                aria-label={`${active ? "正在观察" : "观察合约"} ${contract.contractSymbol}，${isCall ? "Call" : "Put"}，行权价 ${contract.strike}，最新价 ${contract.lastPrice.toFixed(2)}，买卖价 ${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)}，隐含波动率 ${(contract.impliedVolatility * 100).toFixed(1)}%，点差 ${spread}`}
                aria-pressed={active}
                onClick={() => setSelectedSymbol(contract.contractSymbol)}
                className={cx(
                  "w-full rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01)),var(--surface-panel)] p-4 text-left",
                  active ? "border-[var(--border-gold)] shadow-[inset_3px_0_0_rgba(240,185,11,0.85),var(--shadow-gold)]" : "border-[var(--border-subtle)] hover:border-[var(--border-strong)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag tone={isCall ? "up" : "down"}>{isCall ? "Call" : "Put"}</Tag>
                      {nearAtm ? <Tag tone="warn">ATM</Tag> : null}
                    </div>
                    <div className="mt-2 break-all font-mono text-[11px] leading-5 text-[var(--text-muted)]">{contract.contractSymbol}</div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-[var(--border-gold)] bg-[rgba(240,185,11,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[var(--gold-soft)]">
                    {active ? "已选中" : "观察"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Strike</div>
                    <div className="mt-1 font-mono text-xl leading-none text-[var(--text-primary)]">${contract.strike}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Last</div>
                    <div className="mt-1 font-mono text-xl leading-none text-[var(--text-primary)]">${contract.lastPrice.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Bid / Ask</div>
                    <div className="mt-1 font-mono text-[12px] text-[var(--text-secondary)]">
                      ${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">IV / Spread</div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[12px]">
                      <span className="text-[var(--gold-soft)]">{(contract.impliedVolatility * 100).toFixed(1)}%</span>
                      <span className={cx("rounded-lg border px-2 py-0.5", spreadPillClass(spread))}>{spread}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 text-[11px] leading-5 text-[var(--text-muted)]">
                  Vol <span className="font-mono text-[var(--text-secondary)]">{(contract.volume ?? 0).toLocaleString()}</span> · OI{" "}
                  <span className="font-mono text-[var(--text-secondary)]">{(contract.openInterest ?? 0).toLocaleString()}</span>
                </div>
              </button>
            );
          })}
          {visibleContracts.length === 0 ? <div className="rounded-xl border border-[var(--border-subtle)] px-4 py-5 text-[12px] text-[var(--text-muted)]">当前无匹配合约。</div> : null}
        </div>

        <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-panel)] md:block">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.025)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <th className="px-3 py-3 font-medium">Contract</th>
                <th className="px-3 py-3 font-medium">Side</th>
                <th className="px-3 py-3 text-right font-medium">Strike</th>
                <th className="px-3 py-3 text-right font-medium">Last</th>
                <th className="px-3 py-3 text-right font-medium">Bid / Ask</th>
                <th className="px-3 py-3 text-right font-medium">IV</th>
                <th className="px-3 py-3 text-right font-medium">Spread</th>
                <th className="px-3 py-3 text-right font-medium">Vol / OI</th>
                <th className="px-3 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleContracts.map((contract, index) => {
                const active = selectedContract?.contractSymbol === contract.contractSymbol;
                const side = getOptionSide(contract.contractSymbol);
                const isCall = side === "call";
                const iv = (contract.impliedVolatility * 100).toFixed(1);
                const spread = calcSpread(contract.bid, contract.ask);
                const nearAtm = Math.abs(contract.strike - quote.price) / quote.price < 0.03;

                return (
                  <tr
                    key={contract.contractSymbol}
                    className={cx(
                      "border-b border-[var(--border-subtle)] text-sm",
                      index % 2 === 0 ? "bg-transparent" : "bg-[rgba(255,255,255,0.012)]",
                      active ? "bg-[linear-gradient(90deg,rgba(240,185,11,0.13),rgba(240,185,11,0.025))] shadow-[inset_3px_0_0_rgba(240,185,11,0.85)]" : "hover:bg-[rgba(255,255,255,0.03)]",
                    )}
                  >
                    <td className="max-w-[172px] px-3 py-3 font-mono text-[11px] text-[var(--text-muted)]">
                      <div className="truncate">{contract.contractSymbol}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Tag tone={isCall ? "up" : "down"}>{isCall ? "C" : "P"}</Tag>
                        {nearAtm ? <Tag tone="warn">ATM</Tag> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[var(--text-primary)]">${contract.strike}</td>
                    <td className="px-3 py-3 text-right font-mono text-[var(--text-primary)]">${contract.lastPrice.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right font-mono text-[12px] text-[var(--text-secondary)]">
                      ${contract.bid.toFixed(2)} / ${contract.ask.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-[var(--gold-soft)]">{iv}%</td>
                    <td className="px-3 py-3 text-right">
                      <span className={cx("inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-mono", spreadPillClass(spread))}>{spread}</span>
                    </td>
                    <td className="px-3 py-3 text-right text-[11px] leading-5 text-[var(--text-muted)]">
                      <div className="font-mono text-[var(--text-secondary)]">{(contract.volume ?? 0).toLocaleString()}</div>
                      <div>OI {(contract.openInterest ?? 0).toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`${active ? "正在观察" : "观察合约"} ${contract.contractSymbol}`}
                        aria-pressed={active}
                        onClick={() => setSelectedSymbol(contract.contractSymbol)}
                        className={cx(
                          "rounded-lg border px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em]",
                          active
                            ? "border-[var(--border-gold)] bg-[rgba(240,185,11,0.13)] text-[var(--gold-soft)]"
                            : "border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:border-[var(--border-gold)] hover:text-[var(--gold-soft)]",
                        )}
                      >
                        {active ? "已选中" : "观察"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleContracts.length === 0 ? <div className="px-4 py-5 text-[12px] text-[var(--text-muted)]">当前无匹配合约。</div> : null}
        </div>
      </Panel>

      <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <Panel>
          <SectionTitle title="观察笔记" detail="把选中的合约翻译成更容易判断的结构信息。" />
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[var(--border-gold)] bg-[linear-gradient(135deg,rgba(240,185,11,0.14),rgba(240,185,11,0.035)_42%,rgba(255,255,255,0.012)),var(--surface-panel)] px-4 py-4 shadow-[var(--shadow-gold)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--gold-muted)]">selected contract</div>
                  <div className="mt-2 break-all font-mono text-[13px] leading-6 text-[var(--text-primary)]">
                    {selectedContract ? selectedContract.contractSymbol : `从左侧选择一张 ${ticker} 合约`}
                  </div>
                </div>
                {selectedInfo ? <Tag tone={selectedInfo.isATM ? "warn" : selectedSide === "call" ? "up" : "down"}>{selectedInfo.relation}</Tag> : null}
              </div>
              {selectedInfo ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <Tag tone={selectedSide === "call" ? "up" : "down"}>{selectedSide === "call" ? "Call" : "Put"}</Tag>
                  <span className="font-mono">${selectedContract!.strike}</span>
                  <span>离现价 {Math.abs(selectedContract!.strike - quote.price).toFixed(2)}</span>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
              <MetricCard label="权利金" value={selectedInfo?.premium ?? "—"} detail="最新成交价只代表最近一笔，主要用来辅助观察。" tone="warn" />
              <MetricCard label="点差" value={selectedInfo?.spread ?? "—"} detail="点差越大，说明流动性越差，观察价值也会下降。" tone={selectedInfo ? toneForSpread(selectedInfo.spread) : "neutral"} />
              <MetricCard label="隐含波动率" value={selectedInfo?.iv ?? "—"} detail="IV 越高，说明这张期权定价越贵，对波动率变化也更敏感。" tone="warn" />
            </div>

            <PlainExplain title="这张该怎么看？">
              {selectedInfo?.note ?? "先选一张合约，再看它是 ATM、ITM 还是 OTM，以及点差和成交量是否健康。"}
            </PlainExplain>

            <PlainExplain title="为什么这里只提供观察？">
              这页的职责是先帮你看懂合约结构、点差和波动率，不替你做动作判断。
            </PlainExplain>

            <div className="rounded-2xl border border-[rgba(246,70,93,0.28)] bg-[linear-gradient(180deg,rgba(246,70,93,0.11),rgba(246,70,93,0.035)),var(--surface-panel)] px-4 py-3 text-[12px] leading-6 text-[var(--down)]">
              免费数据适合参考和观察，不适合作为高时效决策依据。它可能延迟、缺字段，也可能被限流。
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
