// /currencyUtils.ts
export const getCurrencySymbol = (codeOrName: string): string => {
  const symbolMap: Record<string, string> = {
    USD: "$", "US Dollar": "$",
    CAD: "$", "Canadian Dollar": "$",
    AUD: "$", "Australian Dollar": "$",
    NZD: "$", "New Zealand Dollar": "$",
    SGD: "$", "Singapore Dollar": "$",
    HKD: "$", "Hong Kong Dollar": "$",
    INR: "₹", "Indian Rupee": "₹",
    EUR: "€", "Euro": "€",
    GBP: "£", "British Pound": "£", "Pound": "£",
    JPY: "¥", "Japanese Yen": "¥", "Yen": "¥",
    CNY: "¥", "Chinese Yuan": "¥",
    KRW: "₩", "South Korean Won": "₩", "Won": "₩",
    RUB: "₽", "Russian Ruble": "₽", "Ruble": "₽",
    BRL: "R$", MXN: "$", ZAR: "R",
    AED: "د.إ", SAR: "﷼", TRY: "₺",
    CHF: "CHF", SEK: "kr", NOK: "kr", DKK: "kr",
    PLN: "zł", HUF: "Ft", CZK: "Kč",
    IDR: "Rp", THB: "฿", VND: "₫",
    PHP: "₱", PKR: "₨", BDT: "৳",
    MYR: "RM", LKR: "Rs",
    EGP: "£", NGN: "₦", KES: "KSh"
  };

  return symbolMap[codeOrName] || codeOrName;
};
