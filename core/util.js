import fs from 'fs';
import * as  settings from './settings.js';


function getCandlesFromJson(fileName) {
    const data = fs.readFileSync(fileName, 'utf-8');
    return JSON.parse(data);
}

function highsToLevels(pivots) {
    return pivots.map(p => ({ time: p.time, value: p.high }));
}

function lowsToLevels(pivots) {
    return pivots.map(p => ({ time: p.time, value: p.low }));
}

function processTime(unix) {
    return new Date(unix);
}

function processLevels(levels) {
    return levels.map(p => ({ time: p.time, value: p.high }));
}

function getNext(elements, index) {
    if (index >= elements.length - 1) {
        return null;
    }
    return elements[index + 1];
}

function getRangeDetails(candles) {
    const minOpen = Math.min(...candles.map(c => c.open));
    const minClose = Math.min(...candles.map(c => c.close));
    const minLow = Math.min(...candles.map(c => c.low));
    const maxOpen = Math.max(...candles.map(c => c.open));
    const maxClose = Math.max(...candles.map(c => c.close));
    const maxHigh = Math.max(...candles.map(c => c.high));
    const minOC = Math.min(minOpen, minClose);
    const maxOC = Math.max(maxOpen, maxClose);
    return [ minOC, minLow, maxOC, maxHigh ];
}

function eliminateTriggers(triggers) {
    const levelTriggers = JSON.parse(JSON.stringify(triggers));
    // console.log(levelTriggers)
    for (const i of levelTriggers) {
        const iTime = i.triggerCandle.time;
        for (const j of levelTriggers) {
            const jTime = j.triggerCandle.time;
            if (i.level === j.level && iTime < jTime) {
                const iLookbackHL = i.lookbackHL;
                const jLookbackHL = j.lookbackHL;
                if ((i.signalType.includes('sell') && iLookbackHL >= jLookbackHL) ||
                    (i.signalType.includes('buy') && iLookbackHL <= jLookbackHL)) {
                    levelTriggers.splice(levelTriggers.indexOf(j), 1);
                }
            }
        }
    }
    return levelTriggers;
}

function isActiveSignal(signalTime, uptimeDuration = null) {
    const duration = uptimeDuration || settings.ULTIMATE_SCALPING_SETTINGS.signal_uptime;
    const currentTime = Math.floor(Date.now() / 1000);
    const difference = Math.abs(currentTime - signalTime / 1000);
    return difference <= duration * 60;
}

function createFoSignal(period, trigger) {
    return { period, ...trigger };
}

function getLookbackCandles(candles, lookback, candleIndex) {
    if (lookback <= candleIndex && candleIndex <= candles.length) {
        return candles.slice(candleIndex - lookback, candleIndex + 1);
    }
    return false;
}

function resolveLevel(level) {
    return typeof level === 'object' ? level.value : level;
}

function resolveLevels(levels) {
    return levels.map(level => (typeof level === 'object' ? level.value : level));
}

function getUntestedLevels(candles, levels, signalType) {
    return levels.filter(level => !isTested(candles, level, signalType));
}

function isTested(candles, level, signalType) {
    const maxBreach = settings.ULTIMATE_SCALPING_SETTINGS.max_breach;
    let breach = 0;
    for (const candle of candles) {
        if (parseInt(candle.time) < parseInt(level.time)) {
            continue;
        }
        const levelValue = level.value;
        if (candle.close < levelValue && signalType.endsWith('buy')) {
            breach++;
        }
        if (candle.close > levelValue && signalType.endsWith('sell')) {
            breach++;
        }
        if (breach >= maxBreach) {
            return true;
        }
    }
    return false;
}

function writeToJson(data, fileName) {
    fs.writeFileSync(fileName, JSON.stringify(data, null, 4));
}

function createMarkers(signals) {
    const markers = [];
    for (const signal of signals) {
        if (signal.direction === 'buy') {
            const buyMarker = { ...settings.MARKERS.buy_marker };
            buyMarker.time = signal.time;
            markers.push(buyMarker);
        }
        if (signal.direction === 'sell') {
            const sellMarker = { ...settings.MARKERS.sell_marker };
            sellMarker.time = signal.time;
            markers.push(sellMarker);
        }
    }
    return markers;
}

function getUniqueTrades(trades) {
    let tradesCopy = JSON.parse(JSON.stringify(trades));
    const uniqueTrades = [];
    for (const trade of tradesCopy) {
        uniqueTrades.push(trade);
        tradesCopy = tradesCopy.filter(j => j.entry_price !== trade.entry_price);
    }
    return uniqueTrades;
}

function getTradePeriods(setupPeriod) {
    return settings.ULTIMATE_SCALPING_SETTINGS.trade_periods[setupPeriod];
}

function getDefaultPeriod() {
    return settings.ULTIMATE_SCALPING_SETTINGS.default_period;
}

function sortTradesByTime(trades) {
    // latest to earliest
    const sortedTrades = trades.sort((a, b) => b.time - a.time);
    return JSON.parse(JSON.stringify(sortedTrades));
}

export {
    sortTradesByTime,
    getCandlesFromJson,
    highsToLevels,
    lowsToLevels,
    processTime,
    processLevels,
    getNext,
    getRangeDetails,
    eliminateTriggers,
    isActiveSignal,
    createFoSignal,
    getLookbackCandles,
    resolveLevel,
    resolveLevels,
    getUntestedLevels,
    isTested,
    writeToJson,
    createMarkers,
    getUniqueTrades,
    getTradePeriods,
    getDefaultPeriod
};

