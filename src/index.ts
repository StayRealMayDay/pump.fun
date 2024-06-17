// import WebSocket from "ws";
import Axios from "axios";
// import "reflect-metadata";
// import { myDataSource, pool } from "./mysql";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sleep = (time: number) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(0);
    }, time);
  });
};

// const ws = new WebSocket(
//   "wss://client-api-2-74b1891ee9f9.herokuapp.com/socket.io/?EIO=4&transport=websocket"
// );

// 打开WebSocket连接后立刻发送一条消息:
// ws.on("open", function () {
//   console.log(`[CLIENT] open()`);
//   ws.send("40");
// });

// // 响应收到的消息:
// ws.on("message", function (message) {
//   console.log(`[CLIENT] Received: ${message} ${Array.isArray(message)}`);
//   if (message) {
//     const stringMessage = message.toString();
//     if (stringMessage.includes("tradeCreated")) {
//       const startIndex = stringMessage.indexOf("[");
//       const endIndex = stringMessage.lastIndexOf("]");
//       const content = stringMessage.substring(startIndex, endIndex + 1);
//       const data = JSON.parse(content);
//       console.log({ data });
//     }
//   }
// });

async function fetchComments(id: string) {
  try {
    // console.log({ where: "fetch comment", id });

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
      //   dataList.map(async (item: any) => {

      //   });
      //   console.log({ tokenInfo });
    }
    // pool.getConnection((err, conn) => {});

    // await userRes.save({ id: 123, firstName: "haoran" });
  } catch (e) {
    console.log(e);
  }
};

// fetchHistoryToken("5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo").then(
//   async () => {
//     await prisma.$disconnect();
//   }
// );

// fetchComments("5HvxUFGRRV5FhzJtHDYM5uhSTjWGPp9XQxLLjhMcj382");

// fetchTrades("5HvxUFGRRV5FhzJtHDYM5uhSTjWGPp9XQxLLjhMcj382");

const run = async () => {
  const ids = [
    "5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo",
    "BbkKqTgL738ztDKp9fD7XvAmiBcWBQNAdKc91WZvYZoe",
    "6up3Ma5e4eYtJFEaxhsM47f7SeYQxfjay4BfXnEBWwrw",
    "EFeM9YUwaiwfBh36R82UzszPu9Zzrogtojuo3CtW8mfx",
  ];
  for (const id of ids) {
    await fetchHistoryToken(id);
  }
};

run().then(async () => {
  await prisma.$disconnect();
});

// async function a() {
//   try {
//     await prisma.comment.createMany({
//       data: [
//         {
//           text: "Yall just got bundle rugged",
//           user: "2nWaZa8ueyWSaCQL7DXogFNnUrD6aQ6wJJypVz6WVQXm",
//           username: "chesh_xbt",
//           total_likes: 0,
//           file_uri: null,
//           timestamp: 1716993645538,
//           token_address: "GgquBsDfjT7ArxsJXP5Mpi8aULmSk4qmUvpZP7eaWypH",
//           comment_id: 2963440,
//         },
//       ],
//     });
//   } catch (e) {
//     console.log({ e });
//   }
// }
// a();

// async function tt() {
//   try {
//     const tokenInfo = await prisma.user.createMany({
//       data: [
//         {
//           name: "haoran",
//         },
//         {
//           name: "tt",
//         },
//       ],
//       skipDuplicates: true,
//     });
//     console.log({ tokenInfo });
//   } catch (e) {
//     console.log({ e, where: "error" });
//   }
// }

// tt();
