import {
  Transaction,
  getAccountToken,
  getAccountTransaction,
  getSolTransfer,
  getSplTransfer,
} from "./api/sol-api";

// 找到第一个创建的transaction
export async function findTokenCreateTransaction(token: string) {
  let beforeHash: string | undefined = undefined;
  let lastTransaction: Transaction | undefined = undefined;
  const limit = 50;
  const transactions = await getAccountTransaction({
    account: token,
    limit,
    beforeHash,
  });
  if (!Array.isArray(transactions)) {
    return null;
  } else if (transactions.length === limit) {
    lastTransaction = transactions.pop();
    beforeHash = lastTransaction!.txHash;
  } else if (transactions.length === 0) {
    return lastTransaction;
  } else {
    return transactions.pop();
  }
}

// 寻找创建token之前有无转入
export async function findSolTransferBeforeTransaction(
  transaction: Transaction
) {
  const toTime = transaction.blockTime;
  const accountToken = transaction.signer[0];
  if (accountToken && toTime) {
    const transfers = await getSolTransfer({
      account: accountToken,
      toTime,
      limit: 30,
    });
  }
}

//找到历史创建代币
export async function findHistoryCreatedTokenFromTransactions(
  account: string,
  initBeforeHash?: string
) {
  const limit = 20;
  let offset = 0;
  let beforeHash: string | undefined = initBeforeHash;
  const createdTokenList: string[] = [];
  const createdTokenTransactionList: Transaction[] = [];
  while (createdTokenList.length < 2 && offset < 100) {
    const transactions = await getAccountTransaction({
      account,
      limit,
      beforeHash,
    });
    if (!Array.isArray(transactions) || transactions.length <= 0) {
      return { createdTokenList, createdTokenTransactionList };
    }
    transactions.forEach((transaction) => {
      if (
        Array.isArray(transaction.parsedInstruction) &&
        transaction.parsedInstruction.some((item) => item.type === "create")
      ) {
        if (transaction.signer[1]) {
          createdTokenList.push(transaction.signer[1]);
          createdTokenTransactionList.push(transaction);
        }
      }
    });
    if (transactions.length < limit) {
      return { createdTokenList, createdTokenTransactionList };
    }
    offset += limit;
    beforeHash = transactions.pop()?.txHash;
  }
  return { createdTokenList, createdTokenTransactionList };
}

export async function checkAccountRugWithToken(params: {
  token: string;
  account: string;
  fromTime: number;
  limit: number;
}) {
  const { token, account, fromTime, limit } = params;
  const transfers = await getSplTransfer({ account, fromTime, limit });
  const filteredTransfers = transfers.filter(
    (item) => item.tokenAddress === token
  );
  for (const transfer of filteredTransfers) {
    if (Number(transfer.postBalance) / Math.pow(10, transfer.decimals) < 1) {
      return { isRug: true, lastTransfer: transfer };
    }
  }
  return { isRug: false };
}

export async function historyCreatedTokenAnalysis(params: {
  account: string;
  beforeHash?: string;
}) {
  const { account, beforeHash } = params;
  const { createdTokenList, createdTokenTransactionList } =
    await findHistoryCreatedTokenFromTransactions(account, beforeHash);

  const holdTokenList = await getAccountToken({ account });
  const selledTokenList = createdTokenList.filter((tk) => {
    const holdToken = holdTokenList.find((item) => item.tokenAddress === tk);
    if (holdToken && holdToken.tokenAmount.uiAmount > 1) {
      return false;
    }
    return true;
  });
  const selledTokenTransactionList = createdTokenTransactionList.filter(
    (item) => {
      for (const tk of selledTokenList) {
        return item.signer.some((si) => si === tk);
      }
      return false;
    }
  );

  for (const transaction of selledTokenTransactionList.reverse()) {
    const result = await checkAccountRugWithToken({
      account,
      token: transaction.signer[1],
      fromTime: transaction.blockTime,
      limit: 100,
    });
    if (result.isRug) {
      return {
        ...result,
      };
    }
  }
  return {
    isRug: false,
  };
}

//todo
// 1. 如何识别地址转账地址为okx ,pump.fun等
// 2. 创建代币之后，代币是从pump.fun转入用户地址, 这里是否一定是创建者地址,
// 3. 目前思路是查看当前账号曾经是否rug，查找100个transactions，看是否创建代币，并判断是否还持有
//
