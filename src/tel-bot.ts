import TelegramBot from "node-telegram-bot-api";
import { tokenFromUserStart } from "./load-data";
const token = "7176982520:AAEBxUYWqhVG0bAKGqjDd_ncLC3pNH7YNt8";

const bot = new TelegramBot(token, { polling: true });
let stop: () => void;
const ids: string[] = ["vvvvvvvvvok"];
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match: any) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  console.log({ msg, match });
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  ids.push(match[1]);
  // startMonitor(ids);
  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/listen/, (msg, match: any) => {
  const chatId = msg.chat.id;
  // stop = startMonitor(ids, chatId, bot);
  // startMonitor(ids, chatId, bot);
});

const tokenList: string[] = [];
let loading = false;
bot.onText(/\/token_from_user (.+)/, (msg, match: any) => {
  const chatId = msg.chat.id;
  // const resp = match[1]; // the captured "whatever"
  // ids.push(match[1]);
  if (!match[1]) {
    bot.sendMessage(chatId, "需要一个用户token");
    return;
  }
  if (loading) {
    bot.sendMessage(chatId, token + "已添加入队列中等待爬取");
    tokenList.push(match[1]);
  } else {
    bot.sendMessage(chatId, token + "开始获取数据");
    tokenList.push(match[1]);
    tokenFromUserStart(tokenList, (token: string) => {
      bot.sendMessage(chatId, token + "数据获取完毕");
    });
  }
  // stop = startMonitor(ids, chatId, bot);
  // startMonitor(ids, chatId, bot);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
});
