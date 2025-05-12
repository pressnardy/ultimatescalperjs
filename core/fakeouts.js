import * as util from "./util.js";

function getBullishFA(candles, level, foLookback) {
    const triggers = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const lbLow = getLbLow(candles, candle, level, i);
        if (lbLow === "break") break;
        if (!lbLow) continue;
        const fa = isBullishFA(candles, lbLow, level, foLookback, i);
        if (fa) triggers.push(fa);
    }
    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getBearishFA(candles, level, foLookback) {
    const triggers = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const lbHigh = getLbHigh(candles, candle, level, i);
        if (lbHigh === "break") break;
        if (!lbHigh) continue;
        const fa = isBearishFA(candles, lbHigh, level, foLookback, i);
        if (fa) triggers.push(fa);
    }
    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getBearishSFP(candles, level, foLookback) {
    const triggers = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const lbHigh = getLbHigh(candles, candle, level, i);
        if (lbHigh === "break") break;
        if (!lbHigh) continue;
        const sfp = isBearishSFP(candles, lbHigh, level, foLookback, i);
        if (sfp) triggers.push(sfp);
    }
    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getBullishSFP(candles, level, foLookback) {
    const triggers = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const lbLow = getLbLow(candles, candle, level, i);
        if (lbLow === "break") break;
        if (!lbLow) continue;
        const sfp = isBullishSFP(candles, lbLow, level, foLookback, i);
        if (sfp) triggers.push(sfp);
    }
    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getBullishFakeouts(candles, level, foLookback) {
    const triggers = [];
    const sfp = getBullishSFP(candles, level, foLookback);
    if (sfp) triggers.push(...sfp);

    const fa = getBullishFA(candles, level, foLookback);
    if (fa) triggers.push(...fa);

    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getBearishFakeouts(candles, level, foLookback) {
    const triggers = [];
    const sfp = getBearishSFP(candles, level, foLookback);
    if (sfp) triggers.push(...sfp);

    const fa = getBearishFA(candles, level, foLookback);
    if (fa) triggers.push(...fa);

    return triggers.length ? util.eliminateTriggers(triggers) : null;
}

function getAllSellSignals(candles, levels, foLookback) {
    const fos = [];
    for (const level of levels) {
        const fo = getBearishFakeouts(candles, level, foLookback);
        if (fo) fos.push(...fo);
    }
    return fos;
}

function getAllBuySignals(candles, levels, foLookback) {
    const fos = [];
    for (const level of levels) {
        const fo = getBullishFakeouts(candles, level, foLookback);
        if (fo) fos.push(...fo);
    }
    return fos;
}

function getAllSignals(candles, buyLevels, sellLevels, foLookback) {
    const allSignals = [];
    const buySignals = getAllBuySignals(candles, buyLevels, foLookback);
    const sellSignals = getAllSellSignals(candles, sellLevels, foLookback);
    if (buySignals) allSignals.push(...buySignals);
    if (sellSignals) allSignals.push(...sellSignals);
    return allSignals;
}

function getActiveSignals(candles, pivotLookback, buyLevels, sellLevels, foLookback) {
    const activeSignals = [];
    const signals = getAllSignals(candles, pivotLookback, buyLevels, sellLevels, foLookback);
    for (const signal of signals) {
        const signalTime = signal.time;
        if (util.isActiveSignal(signalTime)) {
            activeSignals.push(signal);
        }
    }
    return activeSignals;
}

function getLbHigh(candles, candle, level, candleIndex) {
    if (parseInt(candle.time) <= level.time) return null;
    const prevCandles = candles.slice(0, candleIndex + 1);
    if (util.isTested(prevCandles, level, "sell")) return "break";
    const lbCandles = getLevelCandles(candles, level, candleIndex);
    if (!lbCandles) return null;
    return Math.max(...lbCandles.map(c => c.high));
}

function getLbLow(candles, candle, level, candleIndex) {
    if (parseInt(candle.time) <= parseInt(level.time)) return null;
    const prevCandles = candles.slice(0, candleIndex + 1);
    if (util.isTested(prevCandles, level, "buy")) return "break";
    const lbCandles = getLevelCandles(candles, level, candleIndex);
    if (!lbCandles) return null;
    return Math.min(...lbCandles.map(c => c.low));
}

function getLevelCandles(candles, level, candleIndex) {
    for (let i = 0; i < candles.length; i++) {
        if (candles[i].time === level.time) {
            return candles.slice(i, candleIndex + 1);
        }
    }
    return null;
}

function getFoRangeDetails(candles, foLookback, candleIndex) {
    const foCandles = util.getLookbackCandles(candles, foLookback, candleIndex);
    return util.getRangeDetails(foCandles);
}

function isBearishSFP(candles, lbHigh, level, foLookback, candleIndex) {
    const [minOC, minLow, maxOC, maxHigh] = getFoRangeDetails(candles, foLookback, candleIndex);
    if (maxHigh !== lbHigh) return false;
    const levelValue = util.resolveLevel(level);
    const candle = candles[candleIndex];
    if (candle.close < candle.open && candle.open <= maxOC && maxOC <= levelValue && levelValue < maxHigh) {
        return {
            triggerCandle: candle,
            lookbackHL: maxHigh,
            signalType: "sfp_sell",
            level: levelValue
        };
    }
    return false;
}

function isBullishSFP(candles, lbLow, level, foLookback, candleIndex) {
    const [minOC, minLow, maxOC, maxHigh] = getFoRangeDetails(candles, foLookback, candleIndex);
    if (minLow !== lbLow) return false;
    const levelValue = util.resolveLevel(level);
    const candle = candles[candleIndex];
    if (candle.close > candle.open && candle.open >= minOC && minOC >= levelValue && levelValue > minLow) {
        return {
            triggerCandle: candle,
            lookbackHL: minLow,
            signalType: "sfp_buy",
            level: levelValue
        };
    }
    return false;
}

function isBullishFA(candles, lbLow, level, foLookback, candleIndex) {
    const [minOC, minLow, maxOC] = getFoRangeDetails(candles, foLookback, candleIndex);
    if (minLow !== lbLow) return false;
    const levelValue = util.resolveLevel(level);
    const candle = candles[candleIndex];
    if (minOC < levelValue && levelValue < maxOC && candle.close > levelValue && levelValue > candle.low) {
        return {
            triggerCandle: candle,
            lookbackHL: minLow,
            signalType: "fa_buy",
            level: levelValue
        };
    }
    return false;
}

function isBearishFA(candles, lbHigh, level, foLookback, candleIndex) {
    const [minOC, , maxOC, maxHigh] = getFoRangeDetails(candles, foLookback, candleIndex);
    if (maxHigh !== lbHigh) return false;
    const levelValue = util.resolveLevel(level);
    const candle = candles[candleIndex];
    if (maxOC > levelValue && levelValue > minOC && candle.close < levelValue && levelValue < candle.high) {
        return {
            triggerCandle: candle,
            lookbackHL: maxHigh,
            signalType: "fa_sell",
            level: levelValue
        };
    }
    return false;
}

export {
    getAllSignals,
    getActiveSignals,
    getAllBuySignals,
    getAllSellSignals,
    getBullishFakeouts,
    getBearishFakeouts,
    getBullishFA,
    getBearishFA,
    getBullishSFP,
    getBearishSFP
};

