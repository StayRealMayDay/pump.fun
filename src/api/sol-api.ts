import Axios from "axios";

const http = Axios.create({
  baseURL: "https://pro-api.solscan.io/v1.0/",
  timeout: 15000,
  headers: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3MjAzNjc1MTAyMzMsImVtYWlsIjoic3RheXJlYWxyaHJAZ21haWwuY29tIiwiYWN0aW9uIjoidG9rZW4tYXBpIiwiaWF0IjoxNzIwMzY3NTEwfQ.8kLyFboAvjRj2s4Y-lv6EPxB-qOqZeSqj5HRi8VIqGE",
  },
});

async function test() {
  const res = await http.get("/block/last");
  console.log({ res, data: res.data });
}

// test();

interface GetSolTransferParams {
  account: string;
  fromTime?: number;
  toTime?: number;
  limit?: number;
  offset?: number;
}

export async function getSolTransfer(params: GetSolTransferParams) {
  try {
    const res = await http.get("/account/solTransfers", {
      params,
    });
    console.log({ res, data: res.data, info: res.data.data });
  } catch (e) {
    console.error({ where: "getSloTransfer Error", e });
  }
}

interface GetSplTransferParams {
  account: string;
  fromTime?: number;
  toTime?: number;
  limit?: number;
  offset?: number;
}
export interface SplTransferItem {
  address: string;
  changeAmount: number;
  preBalance: string;
  postBalance: string;
  blockTime: number;
  tokenName: string;
  decimals: number;
  tokenAddress: string;
}

export async function getSplTransfer(params: GetSplTransferParams) {
  try {
    const res = await http.get<{ data: SplTransferItem[] }>(
      "/account/splTransfers",
      {
        params,
      }
    );
    console.log({ res, data: res.data, info: res.data.data });
    return res.data.data;
  } catch (e) {
    console.error({ where: "getSloTransfer Error", e });
    return [];
  }
}

interface GetAccountTransactionParams {
  account: string;
  beforeHash?: string;
  limit?: number;
}

export enum TransactionStatus {
  Success = "Success",
  Failed = "Fail",
}

export interface Transaction {
  blockTime: number;
  slot: number;
  txHash: string;
  fee: number;
  status: TransactionStatus;
  signer: string[];
  parsedInstruction: { type: string }[];
}

export async function getAccountTransaction(
  params: GetAccountTransactionParams
) {
  try {
    const res = await http.get<Transaction[]>("/account/transactions", {
      params,
    });
    console.log({ res, data: res.data });
    return res.data;
  } catch (e) {
    console.error({ where: "get account transfer error", e });
  }
}

interface AccountHoldTokenInfo {
  tokenAccount: string;
  tokenAddress: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
  decimals: number;
  rentEpoch: number;
  lamports: number;
  tokenSymbol: string;
  tokenName: string;
  tokenIcon: string;
}

export async function getAccountToken(params: { account: string }) {
  try {
    const res = await http.get<AccountHoldTokenInfo[]>("/account/tokens", {
      params,
    });
    return res.data;
  } catch (e) {
    console.error({ where: "getSloTransfer Error", e });
    return [];
  }
}

getAccountTransaction({
  account: "35rNfkAbainqUmLkdDBa9xiqqpQ1X4yZgPMTiqjWrEZH",
});

// getAccountToken({ account: "35rNfkAbainqUmLkdDBa9xiqqpQ1X4yZgPMTiqjWrEZH" });

// getSolTransfer({
//   account: "BytrRZCVzZz8y45hMixHrPtQvMTiQYM7YtyXWkq5RRNe",
//   toTime: 1720551488,
//   offset: 1,
// });

// getSplTransfer({
//   account: "5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo",
// });
