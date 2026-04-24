import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SYMBOLS = ["MSTR", "CRCL", "QQQ"];
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";
const OPTION_EXPIRATION_LIMIT = 4;
const STRIKE_WINDOW = 0.4;
const MIN_CHART_CLOSES = 21;
const FETCH_TIMEOUT_MS = 10_000;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = path.join(rootDir, "src/lib/static-snapshot.ts");
const proxyUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy ?? process.env.HTTP_PROXY ?? process.env.http_proxy;
const generatedImport = 'import { type ChartData, type OptionChainData, type QuoteData } from "@/lib/types";';

if (proxyUrl) {
  console.log("Proxy env detected.");
}

function yahooUrl(pathname, params = {}) {
  const url = new URL(`https://query1.finance.yahoo.com${pathname}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      accept: "application/json,text/plain,*/*",
      "user-agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function requiredPositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} is missing or invalid`);
  }
  return value;
}

function normalizeQuoteFromChart(result, symbol, pairs) {
  const meta = result?.meta ?? {};
  const quote = result?.indicators?.quote?.[0] ?? {};
  const price = requiredPositive(meta.regularMarketPrice ?? pairs.at(-1)?.close, `${symbol} price`);
  const previousClose = requiredPositive(meta.chartPreviousClose ?? pairs.at(-2)?.close, `${symbol} previousClose`);
  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const latestHigh = quote.high?.findLast?.(Number.isFinite) ?? price;
  const latestLow = quote.low?.findLast?.(Number.isFinite) ?? price;
  const latestVolume = quote.volume?.findLast?.(Number.isFinite) ?? meta.regularMarketVolume ?? 0;

  return {
    symbol,
    shortName: meta.shortName ?? meta.longName ?? symbol,
    price,
    previousClose,
    change,
    changePercent,
    volume: finiteNumber(meta.regularMarketVolume, latestVolume),
    dayHigh: finiteNumber(meta.regularMarketDayHigh, latestHigh),
    dayLow: finiteNumber(meta.regularMarketDayLow, latestLow),
    fiftyTwoWeekHigh: finiteNumber(meta.fiftyTwoWeekHigh, price),
    fiftyTwoWeekLow: finiteNumber(meta.fiftyTwoWeekLow, price),
  };
}

async function fetchChartAndQuote(symbol) {
  const data = await fetchJson(
    yahooUrl(`/v8/finance/chart/${encodeURIComponent(symbol)}`, {
      range: "3mo",
      interval: "1d",
      includePrePost: "false",
      events: "history",
    }),
  );
  const result = data?.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const pairs = timestamps
    .map((timestamp, index) => ({ timestamp, close: closes[index] }))
    .filter((item) => Number.isFinite(item.timestamp) && Number.isFinite(item.close));

  if (pairs.length < MIN_CHART_CLOSES) {
    throw new Error(`${symbol} chart has only ${pairs.length} valid closes`);
  }

  return {
    quote: normalizeQuoteFromChart(result, symbol, pairs),
    chart: {
      timestamp: pairs.map((item) => item.timestamp),
      close: pairs.map((item) => item.close),
    },
  };
}

function normalizeContract(contract, expiration) {
  return {
    contractSymbol: contract.contractSymbol,
    strike: finiteNumber(contract.strike),
    lastPrice: finiteNumber(contract.lastPrice),
    bid: finiteNumber(contract.bid),
    ask: finiteNumber(contract.ask),
    change: finiteNumber(contract.change),
    percentChange: finiteNumber(contract.percentChange),
    volume: finiteNumber(contract.volume),
    openInterest: finiteNumber(contract.openInterest),
    impliedVolatility: finiteNumber(contract.impliedVolatility),
    expiration,
    inTheMoney: Boolean(contract.inTheMoney),
  };
}

function filterContractsAroundPrice(contracts, price) {
  const lower = price * (1 - STRIKE_WINDOW);
  const upper = price * (1 + STRIKE_WINDOW);
  return contracts
    .filter((contract) => contract.contractSymbol && contract.strike >= lower && contract.strike <= upper)
    .sort((a, b) => a.expiration - b.expiration || Math.abs(a.strike - price) - Math.abs(b.strike - price));
}

async function fetchOptionChain(symbol, price) {
  const base = await fetchJson(yahooUrl(`/v7/finance/options/${encodeURIComponent(symbol)}`));
  const baseResult = base?.optionChain?.result?.[0];
  if (!baseResult) throw new Error(`option chain not found for ${symbol}`);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expirations = (baseResult.expirationDates ?? [])
    .filter((expiration) => Number.isFinite(expiration) && expiration > nowSeconds)
    .sort((a, b) => a - b)
    .slice(0, OPTION_EXPIRATION_LIMIT);

  if (expirations.length === 0) {
    throw new Error(`${symbol} has no future option expirations`);
  }

  const calls = [];
  const puts = [];
  const strikeSet = new Set();

  for (const expiration of expirations) {
    const data = await fetchJson(yahooUrl(`/v7/finance/options/${encodeURIComponent(symbol)}`, { date: expiration }));
    const chain = data?.optionChain?.result?.[0]?.options?.[0];
    if (!chain) continue;

    for (const contract of chain.calls ?? []) {
      const normalized = normalizeContract(contract, expiration);
      calls.push(normalized);
      strikeSet.add(normalized.strike);
    }

    for (const contract of chain.puts ?? []) {
      const normalized = normalizeContract(contract, expiration);
      puts.push(normalized);
      strikeSet.add(normalized.strike);
    }
  }

  const filteredCalls = filterContractsAroundPrice(calls, price);
  const filteredPuts = filterContractsAroundPrice(puts, price);

  if (filteredCalls.length === 0 && filteredPuts.length === 0) {
    throw new Error(`${symbol} option chain has no contracts near price`);
  }

  const filteredStrikes = [...new Set([...filteredCalls, ...filteredPuts].map((contract) => contract.strike))].sort((a, b) => a - b);

  return {
    symbol,
    expirationDates: expirations,
    strikes: filteredStrikes.length > 0 ? filteredStrikes : [...strikeSet].sort((a, b) => a - b),
    calls: filteredCalls,
    puts: filteredPuts,
  };
}

function serialize(value) {
  return JSON.stringify(value, null, 2);
}

function parseExportedJson(source, exportName, nextExportPattern) {
  const pattern = new RegExp(`export const ${exportName}(?::[^=]+)? = ([\\s\\S]*?);\\n\\n${nextExportPattern}`);
  const match = source.match(pattern);
  if (!match) return null;
  return JSON.parse(match[1]);
}

function parseSnapshotAt(source) {
  const match = source.match(/export const SNAPSHOT_AT = "([^"]+)";/);
  return match?.[1] ?? null;
}

async function loadExistingSnapshot() {
  try {
    const source = await readFile(outputFile, "utf8");
    return {
      snapshotAt: parseSnapshotAt(source),
      quotes: parseExportedJson(source, "SNAPSHOT_QUOTES", "export const SNAPSHOT_CHARTS") ?? [],
      charts: parseExportedJson(source, "SNAPSHOT_CHARTS", "export const SNAPSHOT_OPTION_CHAINS") ?? {},
      optionChains: parseExportedJson(source, "SNAPSHOT_OPTION_CHAINS", "export function getSnapshotQuotes") ?? {},
    };
  } catch {
    return { snapshotAt: null, quotes: [], charts: {}, optionChains: {} };
  }
}

function generateSnapshotSource({ snapshotAt, quotes, charts, optionChains }) {
  return `${generatedImport}\n\nexport const SNAPSHOT_AT = ${JSON.stringify(snapshotAt)};\n\nexport const SNAPSHOT_QUOTES: QuoteData[] = ${serialize(quotes)};\n\nexport const SNAPSHOT_CHARTS: Record<string, ChartData> = ${serialize(charts)};\n\nexport const SNAPSHOT_OPTION_CHAINS: Record<string, OptionChainData> = ${serialize(optionChains)};\n\nexport function getSnapshotQuotes(symbols: string[]): QuoteData[] {\n  const wanted = new Set(symbols.map((symbol) => symbol.toUpperCase()));\n  return SNAPSHOT_QUOTES.filter((quote) => wanted.has(quote.symbol));\n}\n\nexport function getSnapshotOptionChain(ticker: string): OptionChainData | null {\n  return SNAPSHOT_OPTION_CHAINS[ticker.toUpperCase()] ?? null;\n}\n\nexport function getSnapshotChart(ticker: string): ChartData {\n  return SNAPSHOT_CHARTS[ticker.toUpperCase()] ?? { timestamp: [], close: [] };\n}\n`;
}

async function main() {
  const existingSnapshot = await loadExistingSnapshot();
  const quotes = [];
  const charts = {};
  const optionChains = {};
  let fullyRefreshedCount = 0;

  for (const symbol of SYMBOLS) {
    console.log(`Refreshing ${symbol}...`);
    const existingQuote = existingSnapshot.quotes.find((quote) => quote.symbol === symbol);
    let quote = existingQuote;
    let chart = existingSnapshot.charts[symbol];
    let refreshedQuoteChart = false;
    let refreshedOptions = false;

    try {
      ({ quote, chart } = await fetchChartAndQuote(symbol));
      refreshedQuoteChart = true;
    } catch (error) {
      if (!quote || !chart) throw error;
      console.warn(`Using existing quote/chart for ${symbol}: ${error.message}`);
    }

    let optionChain;

    try {
      optionChain = await fetchOptionChain(symbol, quote.price);
      refreshedOptions = true;
    } catch (error) {
      optionChain = existingSnapshot.optionChains[symbol];
      if (!optionChain) throw error;
      console.warn(`Using existing option chain for ${symbol}: ${error.message}`);
    }

    if (refreshedQuoteChart && refreshedOptions) {
      fullyRefreshedCount += 1;
    }

    quotes.push(quote);
    charts[symbol] = chart;
    optionChains[symbol] = optionChain;
  }

  if (fullyRefreshedCount !== SYMBOLS.length) {
    console.warn("Not all symbols fully refreshed; keeping existing snapshot timestamp.");
  }

  const snapshotAt = fullyRefreshedCount === SYMBOLS.length ? new Date().toISOString() : existingSnapshot.snapshotAt ?? new Date().toISOString();
  const source = generateSnapshotSource({ snapshotAt, quotes, charts, optionChains });
  await writeFile(outputFile, source, "utf8");
  console.log(`Wrote ${path.relative(rootDir, outputFile)} at ${snapshotAt}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
