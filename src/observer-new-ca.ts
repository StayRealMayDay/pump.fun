import WebSocket from "ws";
import { PrismaClient } from "@prisma/client";
import { storeTokenMetadatasFromPump } from "./load-data";
const prisma = new PrismaClient();

const ws = new WebSocket("wss://pumpportal.fun/api/data");

ws.on("open", function open() {
  // Subscribing to token creation events
  let payload = {
    method: "subscribeNewToken",
  };
  ws.send(JSON.stringify(payload));

  //   // Subscribing to trades made by accounts
  //   payload = {
  //       method: "subscribeAccountTrade",
  //       keys: ["AArPXm8JatJiuyEffuC1un2Sc835SULa4uQqDcaGpAjV"] // array of accounts to watch
  //     }
  //   ws.send(JSON.stringify(payload));

  //   // Subscribing to trades on tokens
  //   payload = {
  //       method: "subscribeTokenTrade",
  //       keys: ["91WNez8D22NwBssQbkzjy4s2ipFrzpmn5hfvWVe2aY5p"] // array of token CAs to watch
  //     }
  //   ws.send(JSON.stringify(payload));
});

ws.on("message", async function message(data) {
  try {
    // console.log(JSON.parse(data as unknown as string));
    const tokenInfo = JSON.parse(data as unknown as string);
    console.log({ tokenInfo });
    if (tokenInfo.mint) {
      const insertdata = {
        token_address: tokenInfo.mint,
        signature: tokenInfo.signature,
        txType: tokenInfo.txType,
        mint: tokenInfo.mint,
        bondingCurveKey: tokenInfo.bondingCurveKey,
        traderPublicKey: tokenInfo.traderPublicKey,
      };
      await prisma.token_info.upsert({
        where: { token_address: tokenInfo.mint },
        update: insertdata,
        create: insertdata,
      });

      storeTokenMetadatasFromPump([tokenInfo.mint]);
    }
  } catch (e) {
    console.error({ e, where: "sub message" });
  }
});
