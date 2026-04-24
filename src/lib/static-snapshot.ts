import { type ChartData, type OptionChainData, type QuoteData } from "@/lib/types";

export const SNAPSHOT_AT = "2026-04-24T00:00:00.000Z";

export const SNAPSHOT_QUOTES: QuoteData[] = [
  {
    "symbol": "MSTR",
    "shortName": "Strategy Inc",
    "price": 172.47,
    "previousClose": 179.36,
    "change": -6.89,
    "changePercent": -3.84144,
    "volume": 19260411,
    "dayHigh": 180.9,
    "dayLow": 171.5401,
    "fiftyTwoWeekHigh": 457.22,
    "fiftyTwoWeekLow": 104.17
  },
  {
    "symbol": "CRCL",
    "shortName": "Circle Internet Group, Inc.",
    "price": 100.01,
    "previousClose": 104.36,
    "change": -4.35,
    "changePercent": -4.16826,
    "volume": 7239439,
    "dayHigh": 103.62,
    "dayLow": 97.9,
    "fiftyTwoWeekHigh": 298.99,
    "fiftyTwoWeekLow": 49.9
  },
  {
    "symbol": "QQQ",
    "shortName": "Invesco QQQ Trust, Series 1",
    "price": 651.42,
    "previousClose": 655.11,
    "change": -3.69,
    "changePercent": -0.563265,
    "volume": 39178683,
    "dayHigh": 656.92,
    "dayLow": 645.525,
    "fiftyTwoWeekHigh": 656.92,
    "fiftyTwoWeekLow": 455.83
  }
];

export const SNAPSHOT_CHARTS: Record<string, ChartData> = {
  "MSTR": {
    "timestamp": [
      1718841600000,
      1718928000000,
      1719187200000,
      1719273600000,
      1719360000000,
      1719446400000,
      1719532800000,
      1719792000000,
      1719878400000,
      1719964800000,
      1720051200000,
      1720137600000,
      1720396800000,
      1720483200000,
      1720569600000,
      1720656000000,
      1720742400000,
      1721001600000,
      1721088000000,
      1721174400000,
      1721260800000
    ],
    "close": [
      138.2,
      141.6,
      144.5,
      146.1,
      149.8,
      151.2,
      153.7,
      156.4,
      158.9,
      160.8,
      162.1,
      164.9,
      166.2,
      168.7,
      170.5,
      171.3,
      173.8,
      175.2,
      177.1,
      179.36,
      172.47
    ]
  },
  "CRCL": {
    "timestamp": [
      1718841600000,
      1718928000000,
      1719187200000,
      1719273600000,
      1719360000000,
      1719446400000,
      1719532800000,
      1719792000000,
      1719878400000,
      1719964800000,
      1720051200000,
      1720137600000,
      1720396800000,
      1720483200000,
      1720569600000,
      1720656000000,
      1720742400000,
      1721001600000,
      1721088000000,
      1721174400000,
      1721260800000
    ],
    "close": [
      71.2,
      73.5,
      74.1,
      75.9,
      77.3,
      79.1,
      81.4,
      83.2,
      85.7,
      87.4,
      88.9,
      90.1,
      91.5,
      93.8,
      95.6,
      96.4,
      98.2,
      101.7,
      103.4,
      104.36,
      100.01
    ]
  },
  "QQQ": {
    "timestamp": [
      1718841600000,
      1718928000000,
      1719187200000,
      1719273600000,
      1719360000000,
      1719446400000,
      1719532800000,
      1719792000000,
      1719878400000,
      1719964800000,
      1720051200000,
      1720137600000,
      1720396800000,
      1720483200000,
      1720569600000,
      1720656000000,
      1720742400000,
      1721001600000,
      1721088000000,
      1721174400000,
      1721260800000
    ],
    "close": [
      608.2,
      611.5,
      615.1,
      618.4,
      620.9,
      624.8,
      628.3,
      631.1,
      633.6,
      636.4,
      639.7,
      642.8,
      645.6,
      647.9,
      649.4,
      650.1,
      652.8,
      654.2,
      655.8,
      655.11,
      651.42
    ]
  }
};

export const SNAPSHOT_OPTION_CHAINS: Record<string, OptionChainData> = {
  "MSTR": {
    "symbol": "MSTR",
    "expirationDates": [
      1776988800,
      1777593600
    ],
    "strikes": [
      160,
      165,
      170,
      172.5,
      175,
      180
    ],
    "calls": [
      {
        "contractSymbol": "MSTR260424C00160000",
        "strike": 160,
        "lastPrice": 13.9,
        "bid": 13.7,
        "ask": 14.1,
        "change": -1.4,
        "percentChange": -9.1,
        "volume": 1812,
        "openInterest": 4981,
        "impliedVolatility": 0.924,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "MSTR260424C00165000",
        "strike": 165,
        "lastPrice": 8.62,
        "bid": 8.45,
        "ask": 8.8,
        "change": -1.12,
        "percentChange": -11.5,
        "volume": 4289,
        "openInterest": 8352,
        "impliedVolatility": 0.892,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "MSTR260424C00170000",
        "strike": 170,
        "lastPrice": 4.5,
        "bid": 4.4,
        "ask": 4.6,
        "change": -0.81,
        "percentChange": -15.3,
        "volume": 6924,
        "openInterest": 10144,
        "impliedVolatility": 0.876,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "MSTR260424C00172500",
        "strike": 172.5,
        "lastPrice": 3.11,
        "bid": 3.05,
        "ask": 3.15,
        "change": -0.62,
        "percentChange": -16.6,
        "volume": 7535,
        "openInterest": 9677,
        "impliedVolatility": 0.865,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "MSTR260424C00175000",
        "strike": 175,
        "lastPrice": 2.05,
        "bid": 1.99,
        "ask": 2.1,
        "change": -0.44,
        "percentChange": -17.7,
        "volume": 6188,
        "openInterest": 8244,
        "impliedVolatility": 0.851,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "MSTR260501C00175000",
        "strike": 175,
        "lastPrice": 5.44,
        "bid": 5.3,
        "ask": 5.58,
        "change": -0.51,
        "percentChange": -8.6,
        "volume": 2440,
        "openInterest": 5133,
        "impliedVolatility": 0.832,
        "expiration": 1777593600,
        "inTheMoney": false
      }
    ],
    "puts": [
      {
        "contractSymbol": "MSTR260424P00160000",
        "strike": 160,
        "lastPrice": 1.42,
        "bid": 1.36,
        "ask": 1.47,
        "change": 0.18,
        "percentChange": 14.5,
        "volume": 1430,
        "openInterest": 3410,
        "impliedVolatility": 0.802,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "MSTR260424P00165000",
        "strike": 165,
        "lastPrice": 2.12,
        "bid": 2.05,
        "ask": 2.19,
        "change": 0.24,
        "percentChange": 12.7,
        "volume": 3320,
        "openInterest": 4520,
        "impliedVolatility": 0.818,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "MSTR260424P00170000",
        "strike": 170,
        "lastPrice": 3.5,
        "bid": 3.42,
        "ask": 3.58,
        "change": 0.31,
        "percentChange": 9.7,
        "volume": 5498,
        "openInterest": 5011,
        "impliedVolatility": 0.835,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "MSTR260424P00172500",
        "strike": 172.5,
        "lastPrice": 3.05,
        "bid": 3,
        "ask": 3.1,
        "change": 0.28,
        "percentChange": 10.1,
        "volume": 6112,
        "openInterest": 3142,
        "impliedVolatility": 0.843,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "MSTR260424P00175000",
        "strike": 175,
        "lastPrice": 4.18,
        "bid": 4.08,
        "ask": 4.3,
        "change": 0.33,
        "percentChange": 8.6,
        "volume": 4880,
        "openInterest": 4124,
        "impliedVolatility": 0.852,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "MSTR260501P00175000",
        "strike": 175,
        "lastPrice": 6.92,
        "bid": 6.78,
        "ask": 7.06,
        "change": 0.41,
        "percentChange": 6.3,
        "volume": 2192,
        "openInterest": 2876,
        "impliedVolatility": 0.844,
        "expiration": 1777593600,
        "inTheMoney": true
      }
    ]
  },
  "CRCL": {
    "symbol": "CRCL",
    "expirationDates": [
      1776988800
    ],
    "strikes": [
      90,
      95,
      100,
      105,
      110
    ],
    "calls": [
      {
        "contractSymbol": "CRCL260424C00095000",
        "strike": 95,
        "lastPrice": 7.4,
        "bid": 7.2,
        "ask": 7.6,
        "change": -0.44,
        "percentChange": -5.6,
        "volume": 1822,
        "openInterest": 2441,
        "impliedVolatility": 0.712,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "CRCL260424C00100000",
        "strike": 100,
        "lastPrice": 4.2,
        "bid": 4.08,
        "ask": 4.32,
        "change": -0.35,
        "percentChange": -7.7,
        "volume": 2590,
        "openInterest": 3712,
        "impliedVolatility": 0.694,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "CRCL260424C00105000",
        "strike": 105,
        "lastPrice": 2.1,
        "bid": 2.02,
        "ask": 2.18,
        "change": -0.22,
        "percentChange": -9.5,
        "volume": 2011,
        "openInterest": 2845,
        "impliedVolatility": 0.682,
        "expiration": 1776988800,
        "inTheMoney": false
      }
    ],
    "puts": [
      {
        "contractSymbol": "CRCL260424P00095000",
        "strike": 95,
        "lastPrice": 1.1,
        "bid": 1.02,
        "ask": 1.18,
        "change": 0.11,
        "percentChange": 11.1,
        "volume": 930,
        "openInterest": 1711,
        "impliedVolatility": 0.658,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "CRCL260424P00100000",
        "strike": 100,
        "lastPrice": 2.48,
        "bid": 2.38,
        "ask": 2.56,
        "change": 0.21,
        "percentChange": 9.2,
        "volume": 1421,
        "openInterest": 2144,
        "impliedVolatility": 0.671,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "CRCL260424P00105000",
        "strike": 105,
        "lastPrice": 5.66,
        "bid": 5.52,
        "ask": 5.78,
        "change": 0.4,
        "percentChange": 7.6,
        "volume": 1118,
        "openInterest": 1903,
        "impliedVolatility": 0.688,
        "expiration": 1776988800,
        "inTheMoney": true
      }
    ]
  },
  "QQQ": {
    "symbol": "QQQ",
    "expirationDates": [
      1776988800
    ],
    "strikes": [
      630,
      640,
      650,
      655,
      660,
      670
    ],
    "calls": [
      {
        "contractSymbol": "QQQ260424C00640000",
        "strike": 640,
        "lastPrice": 16.4,
        "bid": 16.2,
        "ask": 16.6,
        "change": -0.94,
        "percentChange": -5.4,
        "volume": 4011,
        "openInterest": 11290,
        "impliedVolatility": 0.228,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "QQQ260424C00650000",
        "strike": 650,
        "lastPrice": 7.9,
        "bid": 7.74,
        "ask": 8.06,
        "change": -0.63,
        "percentChange": -7.4,
        "volume": 8821,
        "openInterest": 15334,
        "impliedVolatility": 0.236,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "QQQ260424C00655000",
        "strike": 655,
        "lastPrice": 4.82,
        "bid": 4.72,
        "ask": 4.92,
        "change": -0.52,
        "percentChange": -9.7,
        "volume": 12412,
        "openInterest": 17103,
        "impliedVolatility": 0.241,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "QQQ260424C00660000",
        "strike": 660,
        "lastPrice": 2.86,
        "bid": 2.8,
        "ask": 2.92,
        "change": -0.33,
        "percentChange": -10.3,
        "volume": 9133,
        "openInterest": 14421,
        "impliedVolatility": 0.247,
        "expiration": 1776988800,
        "inTheMoney": false
      }
    ],
    "puts": [
      {
        "contractSymbol": "QQQ260424P00640000",
        "strike": 640,
        "lastPrice": 1.36,
        "bid": 1.3,
        "ask": 1.41,
        "change": 0.09,
        "percentChange": 7.1,
        "volume": 2112,
        "openInterest": 6140,
        "impliedVolatility": 0.219,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "QQQ260424P00650000",
        "strike": 650,
        "lastPrice": 3.82,
        "bid": 3.74,
        "ask": 3.9,
        "change": 0.21,
        "percentChange": 5.8,
        "volume": 6840,
        "openInterest": 10451,
        "impliedVolatility": 0.229,
        "expiration": 1776988800,
        "inTheMoney": false
      },
      {
        "contractSymbol": "QQQ260424P00655000",
        "strike": 655,
        "lastPrice": 6.84,
        "bid": 6.7,
        "ask": 6.98,
        "change": 0.32,
        "percentChange": 4.9,
        "volume": 7911,
        "openInterest": 11892,
        "impliedVolatility": 0.236,
        "expiration": 1776988800,
        "inTheMoney": true
      },
      {
        "contractSymbol": "QQQ260424P00660000",
        "strike": 660,
        "lastPrice": 10.4,
        "bid": 10.18,
        "ask": 10.62,
        "change": 0.45,
        "percentChange": 4.5,
        "volume": 5320,
        "openInterest": 9388,
        "impliedVolatility": 0.242,
        "expiration": 1776988800,
        "inTheMoney": true
      }
    ]
  }
};

export function getSnapshotQuotes(symbols: string[]): QuoteData[] {
  const wanted = new Set(symbols.map((symbol) => symbol.toUpperCase()));
  return SNAPSHOT_QUOTES.filter((quote) => wanted.has(quote.symbol));
}

export function getSnapshotOptionChain(ticker: string): OptionChainData | null {
  return SNAPSHOT_OPTION_CHAINS[ticker.toUpperCase()] ?? null;
}

export function getSnapshotChart(ticker: string): ChartData {
  return SNAPSHOT_CHARTS[ticker.toUpperCase()] ?? { timestamp: [], close: [] };
}
