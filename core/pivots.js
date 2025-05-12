function defineRange(candles, lookback = 5) {
    const rangeHigh = getRangeHigh(candles, lookback);
    const rangeLow = getRangeLow(candles, lookback);
    return [rangeHigh, rangeLow];
}

function getRangeHigh(candles, lookback) {
    const sortedByHighs = candles.slice(0, candles.length - lookback).sort((a, b) => b.high - a.high);
    for (const candle of sortedByHighs) {
        if (isResistancePivot(candles, candle, lookback)) {
            return candle;
        }
    }
}

function getRangeLow(candles, lookback) {
    const sortedByLows = candles.slice(0, candles.length - lookback).sort((a, b) => a.low - b.low);
    for (const i of sortedByLows) {
        for (const candle of candles) {
            if (i.time === candle.time && isSupportPivot(candles, candle, lookback)) {
                return candle;
            }
        }
    }
}

function isSupportPivot(candles, candle, lookback) {
    const candleIndex = candles.indexOf(candle);
    const startIndex = candleIndex - lookback;
    const endIndex = candleIndex + lookback + 1;

    if (startIndex < 0 || endIndex > candles.length - 1) {
        return false;
    }

    const candleRange = candles.slice(startIndex, endIndex);
    return candle.low === Math.min(...candleRange.map(c => c.low));
}

function isResistancePivot(candles, candle, lookback) {
    const candleIndex = candles.indexOf(candle);
    const startIndex = candleIndex - lookback;
    const endIndex = candleIndex + lookback + 1;

    if (startIndex < 0 || endIndex > candles.length - 1) {
        return false;
    }

    const candleRange = candles.slice(startIndex, endIndex);
    return candle.high === Math.max(...candleRange.map(c => c.high));
}

function isSameCandle(candle1, candle2) {
    try {
        return candle1.time === candle2.time;
    } catch (error) {
        return false;
    }
}

function getLowerLows(candles, lookback) {
    const rangeHigh = getRangeHigh(candles, lookback);
    const lastRange = candles.slice(candles.indexOf(rangeHigh));
    const rangeLow = getRangeLow(lastRange, lookback);

    if (!rangeLow) {
        return null;
    }

    const llRange = lastRange.slice(0, lastRange.indexOf(rangeLow) + lookback + 1);
    const sortedByLows = llRange.sort((a, b) => a.low - b.low);

    let pivots = sortedByLows.filter(c => isSupportPivot(llRange, c, lookback));

    for (const pivot of pivots) {
        const nextPivot = getNext(pivots, pivot);
        if (nextPivot && nextPivot.time > pivot.time) {
            pivots = pivots.filter(p => p !== nextPivot);
        }
    }
    pivots.push(rangeLow);
    return pivots;
}

function getHigherHighs(candles, lookback) {
    const rangeLow = getRangeLow(candles, lookback);
    const lastRange = candles.slice(candles.indexOf(rangeLow));
    const rangeHigh = getRangeHigh(lastRange, lookback);

    if (!rangeHigh) {
        return null;
    }

    const hhRange = lastRange.slice(0, lastRange.indexOf(rangeHigh) + lookback + 1);
    const sortedByHighs = hhRange.sort((a, b) => b.high - a.high);

    let pivots = sortedByHighs.filter(c => isResistancePivot(hhRange, c, lookback));

    for (const pivot of pivots) {
        const nextPivot = getNext(pivots, pivot);
        if (nextPivot && nextPivot.time > pivot.time) {
            pivots = pivots.filter(p => p !== nextPivot);
        }
    }
    pivots.push(rangeHigh);
    return pivots;
}

function getNext(elements, element) {
    try {
        const elementIndex = elements.indexOf(element);
        return elements[elementIndex + 1];
    } catch (error) {
        return null;
    }
}

function getSupportPivots(candles, lookback) {
    const supportPivots = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const startIndex = i - lookback;
        const endIndex = i + lookback + 1;

        if (startIndex < 0 || endIndex > candles.length - 1) {
            continue;
        }

        const lookbackCandles = candles.slice(startIndex, endIndex);
        if (candle.low === Math.min(...lookbackCandles.map(c => c.low))) {
            supportPivots.push(candle);
        }
    }
    return supportPivots;
}

function getLows(candles, lookback) {
    let lows = getSupportPivots(candles, lookback);
    for (const pivot of lows) {
        for (const i of lows) {
            if (i.time > pivot.time && i.low < pivot.low) {
                lows = lows.filter(p => p !== pivot);
            }
        }
    }
    for (const pivot of lows) {
        if (isBreachedSupport(candles, pivot)) {
            lows = lows.filter(p => p !== pivot);
        }
    }
    return lows;
}

function getResistancePivots(candles, lookback) {
    const resistancePivots = [];
    for (let i = 0; i < candles.length; i++) {
        const candle = candles[i];
        const startIndex = i - lookback;
        const endIndex = i + lookback + 1;

        if (startIndex < 0 || endIndex > candles.length - 1) {
            continue;
        }

        const lookbackCandles = candles.slice(startIndex, endIndex);
        if (candle.high === Math.max(...lookbackCandles.map(c => c.high))) {
            candle.breachTime = isBreachedResistance(candles, candle);
            resistancePivots.push(candle);
        }
    }
    return resistancePivots;
}

function getHighs(candles, lookback) {
    let highs = getResistancePivots(candles, lookback);
    for (const pivot of highs) {
        for (const i of highs) {
            if (i.time > pivot.time && i.high > pivot.high) {
                highs = highs.filter(p => p !== pivot);
            }
        }
    }
    for (const pivot of highs) {
        if (isBreachedResistance(candles, pivot)) {
            highs = highs.filter(p => p !== pivot);
        }
    }
    return highs;
}

function isBreachedSupport(candles, pivot) {
    let countBreach = 0;
    for (const candle of candles) {
        if (candle.time > pivot.time && candle.close < pivot.low) {
            countBreach++;
        }
        if (countBreach >= 4) {
            return candle.time;
        }
    }
    return null;
}

function isBreachedResistance(candles, pivot) {
    let countBreach = 0;
    for (const candle of candles) {
        if (candle.time > pivot.time && candle.close > pivot.high) {
            countBreach++;
        }
        if (countBreach >= 4) {
            return candle.time;
        }
    }
    return null;
}


export {
    defineRange,
    getRangeHigh,
    getRangeLow,
    isSupportPivot,
    isResistancePivot,
    isSameCandle,
    getLowerLows,
    getHigherHighs,
    getNext,
    getSupportPivots,
    getLows,
    getResistancePivots,
    getHighs,
    isBreachedSupport,
    isBreachedResistance
};
