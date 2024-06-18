import Axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sleep = (time: number) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(0);
    }, time);
  });
};

const fetchTokenMetadata = async (token: string) => {
  try {
    const url = `https://pumpportal.fun/api/data/token-info?ca=${token}`;
    const res = await Axios.get(url);
    console.log({ where: "fetch token meta data", data: res.data });
    return res.data.data;
  } catch (e) {
    console.error({ e, where: "fetch token metadata error" });
  }
};

export const storeTokenMetadatas = async (tokenList: string[]) => {
  try {
    for (const token of tokenList) {
      const data = await fetchTokenMetadata(token);
      delete data.showName;
      await prisma.token_info.upsert({
        where: { token_address: token },
        update: {
          ...data,
        },
        create: {
          token_address: token,
          ...data,
        },
      });
      await sleep(400);
    }
    tokenList.forEach(async (token) => {});
  } catch (e) {
    console.error({ e, where: "storeTokenMetadata" });
  }
};

async function fetchComments(id: string) {
  try {
    const res = await Axios.get(`https://frontend-api.pump.fun/replies/${id}?`);
    console.log({ where: "comment", id });
    const dataList = res.data?.map((item: any) => ({
      text: item.text,
      user: item.user,
      username: item.username,
      total_likes: item.total_likes,
      file_uri: item.file_uri,
      timestamp: item.timestamp,
      token_address: id,
      comment_id: item.id,
    }));
    await prisma.comment.createMany({
      data: dataList,
      skipDuplicates: true,
    });
    // console.log({ data: res.data, where: "comment" });
  } catch (e) {
    console.error(e);
  }
}

async function fetchTrades(id: string, initOffset: number) {
  try {
    let offset = initOffset;
    let finished = false;
    console.log({
      where: "start fetch trades",
      id,
      initOffset,
    });
    while (!finished) {
      const res = await Axios.get(
        `https://frontend-api.pump.fun/trades/${id}?limit=200&offset=${offset}`
      );
      const dataList = res.data?.map((item: any) => {
        return {
          token_address: id,
          user: item.user,
          username: item.username,
          sol_amount: item.sol_amount,
          token_amount: item.token_amount,
          timestamp: item.timestamp,
          tx_index: item.tx_index,
          signature: item.signature,
          is_buy: item.is_buy,
        };
      });
      console.log({
        where: "fetch trades",
        id,
        offset,
        length: dataList.length,
      });
      await prisma.trade.createMany({
        data: dataList,
        skipDuplicates: true,
      });
      if (dataList.length < 200) {
        finished = true;
      } else {
        offset += 200;
      }
      await sleep(500);
    }
  } catch (e) {
    console.error(e);
  }
}

const fetchHistoryToken = async (id: string) => {
  try {
    let next = "";
    let finished = false;

    while (!finished) {
      const url = `https://gmgn.ai/defi/quotation/v1/wallet/sol/holdings/${id}?orderby=last_active_timestamp&direction=desc&showsmall=true&sellout=true&limit=50&tx30d=true${
        next ? "&cursor=" + next : undefined
      }`;
      const res = await Axios.get(url);
      const data = res.data.data;
      // console.log({ data: data, next, item: data.holdings[0], url });
      if (data.next && data.next !== next) {
        next = data.next;
      } else {
        finished = true;
      }
      const dataList = data.holdings?.map((item: any) => {
        return {
          token_address: item.token_address,
          name: item.name,
          symbol: item.symbol,
        };
      });
      const tokenInfo = await prisma.token_info.createMany({
        data: dataList,
        skipDuplicates: true,
      });
      storeTokenMetadatas(dataList.map((item: any) => item.token_address));
      for (const item of dataList) {
        console.log({ where: "fetch token", item });
        const trades = await prisma.trade.findMany({
          where: {
            token_address: item.token_address,
          },
        });
        await fetchTrades(item.token_address, trades?.length ?? 0);
        await fetchComments(item.token_address);
        await sleep(500);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const run = async () => {
  const ids = [
    "5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo",
    "BbkKqTgL738ztDKp9fD7XvAmiBcWBQNAdKc91WZvYZoe",
    "6up3Ma5e4eYtJFEaxhsM47f7SeYQxfjay4BfXnEBWwrw",
    "EFeM9YUwaiwfBh36R82UzszPu9Zzrogtojuo3CtW8mfx",
    "D3zetbZm7s9XMCBqKgurhZ5Qu1tGgJUg9wKKnPennHet",
    "DYRZqQgxxyDgjEthBhtUeMLAEUvoBRcMdTX61xiBXKEE",
  ];
  for (const id of ids) {
    await fetchHistoryToken(id);
  }
};

run().then(async () => {
  await prisma.$disconnect();
});

// fetchTokenMetadata("HwLsW1m9MzNVAfrax3XvwfBctndvC22cnSbMdWRMMFne");

// storeTokenMetadatas(["HwLsW1m9MzNVAfrax3XvwfBctndvC22cnSbMdWRMMFne"]);
