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
    await sleep(15000);
    // if(e?.response)
    // storeTokenMetadatas([token]);
  }
};

export const storeTokenMetadatas = async (tokenList: string[]) => {
  try {
    for (const token of tokenList) {
      await sleep(4000);
      const data = await fetchTokenMetadata(token);
      if (data) {
        const insertData = {
          token_address: token,
          name: data.name,
          symbol: data.symbol,
          description: data.description,
          image: data.image,
          createdOn: data.createdOn,
          twitter: data.twitter ?? data.extensions?.twitter,
          telegram: data.telegram ?? data.extensions?.telegram,
          website: data.website ?? data.extensions?.website,
        };
        await prisma.token_info.upsert({
          where: { token_address: token },
          update: insertData,
          create: insertData,
        });
        // console.log({ result });
      } else {
        await sleep(30000);
      }
    }
  } catch (e) {
    console.error({ e, where: "storeTokenMetadata" });
  }
};

export const queryAndStoreTokenMeta = async () => {
  try {
    let cursor = 979;
    while (true) {
      const data = await prisma.token_info.findMany({
        take: 100,
        skip: 1,
        cursor: { id: cursor },
        orderBy: {
          id: "asc",
        },
      });
      console.log({
        where: "query and store",
        cursor,
        dataLength: data.length,
      });
      if (data.length > 0) {
        const emptyData = data.filter((item) => !Boolean(item.description));
        if (emptyData.length > 0) {
          await storeTokenMetadatas(data.map((item) => item.token_address));
        }
        cursor = data.pop()?.id ?? 0;
      } else {
        await sleep(30000);
      }
    }
  } catch (e) {
    console.error({ e, where: "query and store error" });
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

export const fetchTradeAndCommentOfToken = async (token: string) => {
  const trades = await prisma.trade.findMany({
    where: {
      token_address: token,
    },
  });
  await fetchTrades(token, trades?.length ?? 0);
  await fetchComments(token);
  await sleep(500);
};

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
      const dataList = data.holdings?.map((item: any) => ({
        token_address: item.token_address,
        name: item.name,
        symbol: item.symbol,
      }));
      await prisma.token_info.createMany({
        data: dataList,
        skipDuplicates: true,
      });
      const tokenList = await prisma.token_info.findMany({
        where: {
          token_address: {
            in: dataList.map((item: any) => item.token_address),
          },
        },
      });
      await storeTokenMetadatas(
        tokenList
          .filter((item) => !Boolean(item.description))
          .map((item) => item.token_address)
      );
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

export const updateTradesAndCommentOfAllToken = async (
  initCursor: number = 979
) => {
  try {
    let cursor = initCursor;
    while (true) {
      const data = await prisma.token_info.findMany({
        take: 100,
        skip: 1,
        cursor: { id: cursor },
        orderBy: {
          id: "asc",
        },
      });

      if (data.length > 0) {
        for (const item of data) {
          await fetchTradeAndCommentOfToken(item.token_address);
        }
        cursor = data.pop()?.id ?? 0;
      } else {
        break;
        // await sleep(30000);
      }
    }
    console.log({ where: "updateTradesAndCommentOfAllToken finished" });
  } catch (e) {
    console.error({ e, where: "updateTradesAndCommentOfAllToken error" });
  }
};

// const run = async () => {
//   const ids = [
//     "5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo",
//     "BbkKqTgL738ztDKp9fD7XvAmiBcWBQNAdKc91WZvYZoe",
//     "6up3Ma5e4eYtJFEaxhsM47f7SeYQxfjay4BfXnEBWwrw",
//     "EFeM9YUwaiwfBh36R82UzszPu9Zzrogtojuo3CtW8mfx",
//     "D3zetbZm7s9XMCBqKgurhZ5Qu1tGgJUg9wKKnPennHet",
//     "DYRZqQgxxyDgjEthBhtUeMLAEUvoBRcMdTX61xiBXKEE",
//     "orcACRJYTFjTeo2pV8TfYRTpmqfoYgbVi9GeANXTCc8",
//   ];
//   for (const id of ids) {
//     await fetchHistoryToken(id);
//   }
// };

export const tokenFromUserStart = async (
  tokens: string[],
  fn: (to: string) => void
) => {
  while (tokens.length > 0) {
    const id = tokens.pop();
    id && (await fetchHistoryToken(id));
    id && fn(id);
  }
};

// fetchTokenMetadata("Doge9xAuYPC4DBzsBuvoTd8B5HxqyS3kaYc5EdBuVPKV");

// updateTradesAndCommentOfAllToken();

// run().then(async () => {
//   await prisma.$disconnect();
// });
// queryAndStoreTokenMeta();
// fetchTokenMetadata("9hLWZJhpnbWDLh75CuXQP7U7MCos61z8PoxBFVCVAq95");
// storeTokenMetadatas(["8MDoSLLYrKMCag6cRVU6N7KFKDkcAWxpaTFw5Q9Vw5u9"]);

// fetchTokenMetadata("HwLsW1m9MzNVAfrax3XvwfBctndvC22cnSbMdWRMMFne");

// storeTokenMetadatas(["HwLsW1m9MzNVAfrax3XvwfBctndvC22cnSbMdWRMMFne"]);
