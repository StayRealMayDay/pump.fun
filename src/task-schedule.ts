import schedule from "node-schedule";
import { updateTradesAndCommentOfAllToken } from "./load-data";

const updateTradeInfoSchedule = () => {
  schedule.scheduleJob("00 00 03 * * *", () => {
    updateTradesAndCommentOfAllToken();
    // console.log("hhh");
  });
};

updateTradeInfoSchedule();
