import {ULTIMATE_DCA_SETTINGS} from "../core/settings.js";
import * as pivots from "../core/pivots.js";

function getSellLevels(entry_price) {
return {
    "tp1": entry_price * 2,
    "tp2": entry_price * 3,
    "tp3": entry_price * 10,
    }
}

function getBuyLevels(candles) {
    const lows = pivots.getLows(candles, ULTIMATE_DCA_SETTINGS.pivot_lookback);
    return lows.map(low => low.low);
}


function getTrade(candles) {
    if (!candles?.length) {
    return null;
    }

    const buyLevels = getBuyLevels(candles);
    if (!buyLevels?.length) {
    return null;
    }

    const entryPrice = buyLevels.find(level => candles.at(-1).low <= level);
    if (!entryPrice) {
    return null;
    }

    const sellLevels = getSellLevels(entryPrice);

    return {
    entryPrice: entryPrice,
    ...sellLevels, // Assuming getSellLevels returns an object with tp1, tp2, tp3
    };
}
