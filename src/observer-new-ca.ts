import WebSocket from "ws";

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
  ws.send(JSON.stringify(payload));
});

ws.on("message", function message(data) {
  console.log(JSON.parse(data as unknown as string));
});
