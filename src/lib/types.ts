export type ChartData = {
  timestamp: number[];
  close: number[];
};

export type QuoteData = {
  symbol: string;
  shortName: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
};

export type OptionContractData = {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  bid: number;
  ask: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  expiration: number;
  inTheMoney: boolean;
};

export type OptionChainData = {
  symbol: string;
  expirationDates: number[];
  strikes: number[];
  calls: OptionContractData[];
  puts: OptionContractData[];
};
