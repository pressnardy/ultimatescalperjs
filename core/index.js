import * as pivots from "./pivots.js";
import * as settings from "./settings.js";
import * as apirequests from "./apirequests.js";
import * as fakeouts from "./fakeouts.js";
import * as util from "./util.js";


const candles = await apirequests.getCandles("4h", 500, "BTCUSDT");

const lows = pivots.getSupportPivots(candles, 30);

const buyLevels = util.lowsToLevels(lows);
const fakeOuts = fakeouts.getAllBuySignals(candles, buyLevels, 5);

console.log(fakeOuts);

