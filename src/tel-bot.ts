import TelegramBot from "node-telegram-bot-api";
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

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
});
