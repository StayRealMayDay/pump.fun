import WebSocket from "ws";
import Axios from "axios";
import "reflect-metadata";
import { myDataSource, pool } from "./mysql";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sleep = (time: number) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(0);
    }, time);
  });
};

const ws = new WebSocket(
  "wss://client-api-2-74b1891ee9f9.herokuapp.com/socket.io/?EIO=4&transport=websocket"
);

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
    console.log({ where: "fetch comment", id });

    const res = await Axios.get(
      `https://client-api-2-74b1891ee9f9.herokuapp.com/replies/${id}?`
    );
    const dataList = res.data?.map((item: any) => ({
      text: item.text,
      user: item.user,
      username: item.username,
      total_likes: item.total_likes,
      file_uri: item.file_uri,
      timestamp: item.timestamp,
      token_address: id,
    }));
    // console.log({ data: res.data });
    await prisma.comment.createMany({
      data: dataList,
    });
  } catch (e) {
    console.error(e);
  }
}

async function fetchTrades(id: string) {
  try {
    let offset = 0;
    let finished = false;
    while (!finished) {
      const res = await Axios.get(
        `https://client-api-2-74b1891ee9f9.herokuapp.com/trades/${id}?limit=200&offset=${offset}`
      );
      const dataList = res.data?.map((item: any) => ({
        token_address: id,
        user: item.user,
        username: item.username,
        sol_amount: item.sol_amount,
        token_amount: item.token_amount,
        timestamp: item.timestamp,
        tx_index: item.tx_index,
        signature: item.signature,
        is_buy: item.is_buy,
      }));
      //   console.log({ dataList });
      console.log({
        where: "fetch trades",
        id,
        offset,
        length: dataList.length,
      });

      await prisma.trade.createMany({
        data: dataList,
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

const fetchHistoryToken = async () => {
  try {
    let next = "";
    let finished = false;

    while (!finished) {
      const url = `https://gmgn.ai/defi/quotation/v1/wallet/sol/holdings/5jKYiAzPLB2GWscbT3b1raVcrkz4ehTYcE9GBqNn7FZo?orderby=last_active_timestamp&direction=desc&showsmall=true&sellout=true&limit=50&tx30d=true${
        next ? "&cursor=" + next : undefined
      }`;
      const res = await Axios.get(url);
      const data = res.data.data;
      //   console.log({ data: data, next, item: data.holdings[0], url });
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
      const tokenInfo = await prisma.token_info.createMany({
        data: dataList,
      });
      for (const item of dataList) {
        console.log({ where: "fetch token", item });

        await fetchTrades(item.token_address);
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

fetchHistoryToken().then(async () => {
  await prisma.$disconnect();
});

// fetchComments("5HvxUFGRRV5FhzJtHDYM5uhSTjWGPp9XQxLLjhMcj382");

// fetchTrades("5HvxUFGRRV5FhzJtHDYM5uhSTjWGPp9XQxLLjhMcj382");
