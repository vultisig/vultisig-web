import { Currency, currencySymbol } from "utils/constants";

declare global {
  interface Number {
    toBalanceFormat(digits?:number): string;
    toHexFormat(zeroPad: number): string;
    toNumberFormat(): string;
    toValueFormat(currency: Currency): string;
  }

  interface String {
    replaceArgs(args: string[]): string;
  }
}

Number.prototype.toBalanceFormat = function (digits=6) {
  const million = 1000 * 1000;
  const billion = million * 1000;
  const tillion = billion * 1000;

  let value: number = parseFloat(`${this}`);
  let symbol: string = "";
  let decimals: number = 2;

  if (value >= tillion) {
    symbol = "T";
    value = value / tillion;
  } else if (value >= billion) {
    symbol = "B";
    value = value / billion;
  } else if (value >= million) {
    symbol = "M";
    value = value / million;
  } else if (value) {
    const length = this.toString().split(".")[1]?.length;

    decimals =
      value >= 1000 ? (length > 3 ? 3 : length) : length > digits ? digits : length;
  }

  const formattedValue = value.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${formattedValue}${symbol}`;
};

Number.prototype.toHexFormat = function (zeroPad = 0) {
  let hex = this.toString(16);

  while (hex.length < zeroPad) hex = `0${hex}`;

  return hex;
};

Number.prototype.toNumberFormat = function () {
  const formattedValue = this.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return formattedValue;
};

Number.prototype.toValueFormat = function (currency: Currency) {
  const formattedValue = this.toLocaleString("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currencySymbol[currency]}${formattedValue}`;
};

String.prototype.replaceArgs = function (args) {
  return this.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== "undefined" ? args[number] : match;
  });
};
