
import {playWave} from '../alerts/sounds.js';
import * as util from '../core/util.js';
import {Scalper} from './ultimatescalping.js/'

const stopAlert = false;

async function getSetupCandles(symbol, setupPeriod = null) {
    // console.log('setup period', period);
    const scalper = new Scalper(symbol, setupPeriod);
    const candles = await scalper.getSetupCandles();
    // console.log('setup candles', candles);
    const buyLevels = await scalper.getBuyLevels()
    const sellLevels = await scalper.getSellLevels()
    return Promise.resolve({candles, buyLevels, sellLevels});
}

async function getTrade(symbol, setupPeriod=null, tradePeriod=null) {
    const scalper = new Scalper(symbol, setupPeriod, tradePeriod);
    const trade = await scalper.getTrade();

    return Promise.resolve(trade);
}


async function getPrevTrades(symbol, setupPeriod = null, tradePeriod = null) {
    const scalper = new Scalper(symbol, setupPeriod, tradePeriod);
    let prevTrades = await scalper.getPrevTrades();
    prevTrades = util.sortTradesByTime(prevTrades);
    // console.log(prevTrades);
    const markers = getMarkers(prevTrades);

    return {prevTrades, markers}
}


async function getBuyLevels(symbol, setupPeriod = null, tradePeriod = null) {
    const scalper = new Scalper(symbol, setupPeriod, tradePeriod);
    const levels = await scalper.getBuyLevels();
    return Promise.resolve(levels);
}


async function getSellLevels(symbol, setupPeriod = null, tradePeriod = null) {
    const scalper = new Scalper(symbol, setupPeriod, tradePeriod);
    const levels = await scalper.getSellLevels();
    return Promise.resolve(levels);
}

function getMarkers(trades){
    return util.createMarkers(trades);

}


async function getActiveTrades(symbols, setupPeriod = null, tradePeriod = null) {
    const activeTrades = [];
    for(let symbol of symbols) {
        const trade = await getTrade(symbol, setupPeriod, tradePeriod);
        if (!trade) {
            return null;
        }
        const tradeTime = trade.time;
        activeTrades.push(trade);
    }
    return activeTrades;
}

function playAlert(stopAlert) {
    while (!stopAlert) {
        playWave();
    }
}

async function startStrategy(symbols, setupPeriod = null, tradePeriod = null, stopAlert = false) {
    while (true) {
        let activeTrades = await getActiveTrades(symbols, setupPeriod, tradePeriod);
        activeTrades = Promise.resolve(activeTrades);
        if (activeTrades.length) {
            playAlert(stopAlert);
        }
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
}


export { getSetupCandles, getTrade, getPrevTrades, getBuyLevels, getSellLevels, getMarkers, getActiveTrades, startStrategy};


// const setupCandles = await getSetupCandles("BTCUSDT", "4h");
// const trade = await getTrade("BTCUSDT", "4h", "4h");
// const prevTrades = await getPrevTrades("BTCUSDT", "4h", "4h");
// const buyLevels = await getBuyLevels("BTCUSDT", "4h", "4h");
// const sellLevels = await getSellLevels("BTCUSDT", "4h", "4h");
//
// console.log(prevTrades['markers'][0]);
