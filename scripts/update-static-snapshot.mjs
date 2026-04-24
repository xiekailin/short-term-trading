import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SYMBOLS = ["MSTR", "CRCL", "QQQ"];
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36";
const OPTION_EXPIRATION_LIMIT = 4;
const STRIKE_WINDOW = 0.4;
const MIN_CHART_CLOSES = 21;
const FETCH_TIMEOUT_MS = 10_000;
const FALLBACK_52_WEEK_RANGES = {
  MSTR: { high: 457.22, low: 104.16 },
  CRCL: { high: 298.99, low: 49.9 },
  QQQ: { high: 656.92, low: 455.83 },
};

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

function nasdaqUrl(symbol, endpoint, params = {}) {
  const assetclass = symbol === "QQQ" ? "etf" : "stocks";
  const url = new URL(`https://api.nasdaq.com/api/quote/${encodeURIComponent(symbol)}/${endpoint}`);
  url.searchParams.set("assetclass", assetclass);
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

function parseMarketNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  const normalized = value.replace(/[$,%+,]/g, "").trim();
  if (normalized === "" || normalized.toUpperCase() === "N/A" || normalized.toUpperCase() === "NA") return NaN;
  return Number(normalized);
}

function parseNasdaqDate(value) {
  if (typeof value !== "string") return NaN;

  const parts = value.split("/");
  if (parts.length !== 3) return NaN;

  const [month, day, year] = parts.map(Number);
  if (!month || !day || !year) return NaN;
  return Date.UTC(year, month - 1, day) / 1000;
}

function dateInput(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function parseFiftyTwoWeekRange(value) {
  if (typeof value !== "string") return [NaN, NaN];

  const numbers = value.match(/[-+]?[\d,]+(?:\.\d+)?/g)?.map(parseMarketNumber) ?? [];
  if (numbers.length < 2) return [NaN, NaN];

  return [Math.min(numbers[0], numbers[1]), Math.max(numbers[0], numbers[1])];
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

async function fetchYahooChartAndQuote(symbol) {
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

async function fetchNasdaqChartAndQuote(symbol, fallbackQuote) {
  const [info, history] = await Promise.all([
    fetchJson(nasdaqUrl(symbol, "info")),
    fetchJson(
      nasdaqUrl(symbol, "historical", {
        fromdate: dateInput(140),
        todate: dateInput(0),
        limit: 9999,
      }),
    ),
  ]);

  const rows = history?.data?.tradesTable?.rows ?? [];
  const pairs = rows
    .map((row) => ({
      timestamp: parseNasdaqDate(row.date),
      close: parseMarketNumber(row.close),
      high: parseMarketNumber(row.high),
      low: parseMarketNumber(row.low),
      volume: parseMarketNumber(row.volume),
    }))
    .filter((item) => Number.isFinite(item.timestamp) && Number.isFinite(item.close))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (pairs.length < MIN_CHART_CLOSES) {
    throw new Error(`${symbol} Nasdaq chart has only ${pairs.length} valid closes`);
  }

  const primaryData = info?.data?.primaryData ?? {};
  const keyStats = info?.data?.keyStats ?? {};
  const price = requiredPositive(parseMarketNumber(primaryData.lastSalePrice) || pairs.at(-1)?.close, `${symbol} Nasdaq price`);
  const previousClose = requiredPositive(pairs.at(-2)?.close, `${symbol} Nasdaq previousClose`);
  const change = Number.isFinite(parseMarketNumber(primaryData.netChange)) ? parseMarketNumber(primaryData.netChange) : price - previousClose;
  const changePercent = Number.isFinite(parseMarketNumber(primaryData.percentageChange)) ? parseMarketNumber(primaryData.percentageChange) : (change / previousClose) * 100;
  const [fiftyTwoWeekLow, fiftyTwoWeekHigh] = parseFiftyTwoWeekRange(keyStats.fiftyTwoWeekHighLow?.value);
  const fallbackRange = FALLBACK_52_WEEK_RANGES[symbol];
  const latest = pairs.at(-1);

  return {
    quote: {
      symbol,
      shortName: info?.data?.companyName ?? symbol,
      price,
      previousClose,
      change,
      changePercent,
      volume: finiteNumber(parseMarketNumber(primaryData.volume), latest?.volume ?? 0),
      dayHigh: finiteNumber(latest?.high, price),
      dayLow: finiteNumber(latest?.low, price),
      fiftyTwoWeekHigh: finiteNumber(fiftyTwoWeekHigh, fallbackQuote?.fiftyTwoWeekHigh ?? fallbackRange?.high ?? price),
      fiftyTwoWeekLow: finiteNumber(fiftyTwoWeekLow, fallbackQuote?.fiftyTwoWeekLow ?? fallbackRange?.low ?? price),
    },
    chart: {
      timestamp: pairs.map((item) => item.timestamp),
      close: pairs.map((item) => item.close),
    },
  };
}

async function fetchChartAndQuote(symbol, fallbackQuote) {
  try {
    return await fetchYahooChartAndQuote(symbol);
  } catch (error) {
    console.warn(`Yahoo quote/chart failed for ${symbol}: ${error.message}`);
    return fetchNasdaqChartAndQuote(symbol, fallbackQuote);
  }
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
  let quoteChartRefreshedCount = 0;

  for (const symbol of SYMBOLS) {
    console.log(`Refreshing ${symbol}...`);
    const existingQuote = existingSnapshot.quotes.find((quote) => quote.symbol === symbol);
    let quote = existingQuote;
    let chart = existingSnapshot.charts[symbol];

    try {
      ({ quote, chart } = await fetchChartAndQuote(symbol, existingQuote));
      quoteChartRefreshedCount += 1;
    } catch (error) {
      if (!quote || !chart) throw error;
      console.warn(`Using existing quote/chart for ${symbol}: ${error.message}`);
    }

    let optionChain;

    try {
      optionChain = await fetchOptionChain(symbol, quote.price);
    } catch (error) {
      optionChain = existingSnapshot.optionChains[symbol];
      if (!optionChain) throw error;
      console.warn(`Using existing option chain for ${symbol}: ${error.message}`);
    }

    quotes.push(quote);
    charts[symbol] = chart;
    optionChains[symbol] = optionChain;
  }

  if (quoteChartRefreshedCount !== SYMBOLS.length) {
    console.warn("Not all quote/chart data refreshed; keeping existing snapshot timestamp.");
  }

  const snapshotAt = quoteChartRefreshedCount === SYMBOLS.length ? new Date().toISOString() : existingSnapshot.snapshotAt ?? new Date().toISOString();
  const source = generateSnapshotSource({ snapshotAt, quotes, charts, optionChains });
  await writeFile(outputFile, source, "utf8");
  console.log(`Wrote ${path.relative(rootDir, outputFile)} at ${snapshotAt}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
