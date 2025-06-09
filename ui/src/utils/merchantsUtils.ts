import { Merchant } from "./types";

export function merchantDisplayName(merchant: Merchant) {
  return merchant.customName || merchant.name;
}