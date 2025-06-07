import { MonthlySummary } from "./MonthlySummary";

export interface SummaryResponse {
  name: string;
  timezone : string;
  currencyCode: string;
  currencyName: string;
  monthlyData: MonthlySummary[];
}