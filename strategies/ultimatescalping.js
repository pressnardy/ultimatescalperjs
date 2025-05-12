
import * as apirequests from '../core/apirequests.js'
import * as fakeouts from '../core/fakeouts.js'
import Chart from '../core/charting.js'
import { ULTIMATE_SCALPING_SETTINGS } from '../core/settings.js';


class UltimateSetups {
    constructor(candles, buyLevels = null, sellLevels = null) {
        this._candles = candles;
        this._pivotLookback = ULTIMATE_SCALPING_SETTINGS.pivot_lookback;
        this._sellLevels = sellLevels;
        this._buyLevels = buyLevels;
        this._foLookback = ULTIMATE_SCALPING_SETTINGS.fo_lookback;
        this._foCandles = candles.slice(-this._foLookback);
        this._rangeQuantity = ULTIMATE_SCALPING_SETTINGS.default_quantity;
    }

    startChart() {
        return Chart.startChart(this._candles, this._rangeQuantity, this._pivotLookback);
    }

    buyLevels() {
        if (this._buyLevels) {
            return this._buyLevels;
        }
        const chart = this.startChart();
        return chart.lows();
    }

    allBuyLevels() {
        if (this._buyLevels) {
            return this._buyLevels;
        }
        const chart = this.startChart();
        return chart.allLows();
    }

    sellLevels() {
        if (this._sellLevels !== null) {
            return this._sellLevels;
        }
        const chart = this.startChart();
        return chart.highs();
    }

    allSellLevels() {
        if (this._sellLevels !== null) {
            return this._sellLevels;
        }
        const chart = this.startChart();
        return chart.allHighs();
    }

    getSignals() {
        const { _candles, _foLookback } = this;
        const buyLevels = this.buyLevels();
        const sellLevels = this.sellLevels();
        const signals = fakeouts.getAllSignals(_candles, buyLevels, sellLevels, _foLookback);
        if (signals.length) {
            const sortedSignals = signals.sort((a, b) => b.triggerCandle.time - a.triggerCandle.time);
            return sortedSignals[0];
        }
        return null;
    }

    getAllSignals() {
        const { _candles, _foLookback } = this;
        const buyLevels = this.allBuyLevels();
        const sellLevels = this.allSellLevels();
        const allSignals = fakeouts.getAllSignals(_candles, buyLevels, sellLevels, _foLookback);
        return allSignals.length? allSignals : null;
    }
}

class Scalper {
    constructor(symbol=null, setupPeriod=null, signalPeriod=null, signalQuantity=null) {
        this._setupPeriod = setupPeriod;
        this._signalPeriod = signalPeriod;
        this._symbol = symbol;
        this._setupQuantity = ULTIMATE_SCALPING_SETTINGS.default_quantity;
        this._signalQuantity = signalQuantity;
        this._setupCandles = null;
        this._signalCandles = null;

    }

    async getSetupCandles() {
        if (!this._setupCandles) {
            await this.setSetupCandles();
        }
        return this._setupCandles
    }

    async getSignalCandles() {
        if (!this._signalCandles) {
            await this.setSignalCandles();
        }
        return this._signalCandles
    }

    async requestCandles(period, quantity, symbol) {
        return await apirequests.getCandles(period, quantity, symbol);
    }

    get symbol() {
        return this._symbol || ULTIMATE_SCALPING_SETTINGS.default_symbol;
    }

    get setupPeriod() {
        return this._setupPeriod || ULTIMATE_SCALPING_SETTINGS.default_period;
    }

    async setSetupCandles(candles=null) {
        this._setupCandles = candles ?? await this.requestCandles(this.setupPeriod, this._setupQuantity, this.symbol);

    }

    async setSignalCandles(candles=null) {
        this._signalCandles = candles?? await this.requestCandles(this.signalPeriod, this._signalQuantity, this.symbol);
    }
    get signalQuantity() {
        return this._signalQuantity || ULTIMATE_SCALPING_SETTINGS.signal_quantity[this.signalPeriod];
    }

    get signalPeriod() {
        return this._signalPeriod || this.setupPeriod;
    }

    set signalPeriod(value) {
        this._signalPeriod = value;
    }

    async getBuyLevels() {
        const candles = await this.getSetupCandles()
        return new UltimateSetups(candles).buyLevels();
    }

    async getAllBuyLevels() {
        const candles = await this.getSetupCandles();
        return new UltimateSetups(candles).allBuyLevels();
    }

    async getSellLevels() {
        const candles = await this.getSetupCandles();
        return new UltimateSetups(candles).sellLevels();
    }

    async getAllSellLevels() {
        await this.setSetupCandles();
        const candles = this._setupCandles;
        return new UltimateSetups(candles).allSellLevels();
    }

    async getSignal() {
        const candles = await  this.getSignalCandles();
        const buyLevels = await this.getBuyLevels();
        const sellLevels = await this.getSellLevels();
        return new UltimateSetups(candles, buyLevels, sellLevels).getSignals();
    }

    async getAllSignals() {
        const candles = await this.getSignalCandles();
        const buyLevels = await this.getAllBuyLevels();
        const sellLevels = await this.getAllSellLevels();
        return new UltimateSetups(candles, buyLevels, sellLevels).getAllSignals();
    }

    async getTrade() {
        const signal = await this.getSignal();
        return this.getTradeDetail(signal);
    }

    getTradeDetail(signal) {
        if (!signal) return null;
        const tradeDetails = {};
        const buyTrade = new BuyTrade(signal).tradeDetails();
        const sellTrade = new SellTrade(signal).tradeDetails();

        if (buyTrade) Object.assign(tradeDetails, buyTrade);
        if (sellTrade) Object.assign(tradeDetails, sellTrade);

        tradeDetails.type = signal.signalType;
        tradeDetails.period = this.signalPeriod;
        tradeDetails.symbol = this.symbol;

        return tradeDetails;
    }

    async getPrevTrades() {
        const prevTrades = [];
        const signals = await this.getAllSignals();
        if (signals) {
            signals.forEach(signal => {
                const tradeDetails = this.getTradeDetail(signal);
                prevTrades.push(tradeDetails);
            });
        }
        return prevTrades.length ? prevTrades : null;
    }
}


class TradeSetup {
    constructor(signal, tp1Rrr = null, tp2Rrr = null, slPadding = null) {
        this._tp1Rrr = tp1Rrr;
        this._tp2Rrr = tp2Rrr;
        this._slPadding = slPadding;
        this._signal = signal;
        this._lookbackHl = signal.lookbackHL;
        this._triggerCandle = signal.triggerCandle;
        this._entryPrice = signal.triggerCandle.close;
        this._signalTime = signal.triggerCandle.time;
    }

    get entryPrice() {
        return this._entryPrice;
    }

    get signalTime() {
        return this._signalTime;
    }

    get tradeDirection() {
        const signalType = this._signal.signalType;
        if (signalType.endsWith('y')) return 'buy';
        if (signalType.endsWith('l')) return 'sell';
    }

    get tp1Rrr() {
        return this._tp1Rrr || ULTIMATE_SCALPING_SETTINGS.tp1_rrr;
    }

    get tp2Rrr() {
        return this._tp2Rrr || ULTIMATE_SCALPING_SETTINGS.tp2_rrr;
    }

    get slPadding() {
        return this._slPadding !== null ? this._slPadding : ULTIMATE_SCALPING_SETTINGS.stop_lose_padding;
    }

    sellSl() {
        const lookbackHigh = this._lookbackHl;
        return lookbackHigh + (this.slPadding * lookbackHigh);
    }

    buySl() {
        const lookbackLow = this._lookbackHl;
        return lookbackLow - (this.slPadding * lookbackLow);
    }
}

class BuyTrade extends TradeSetup {
    percentageRisk() {
        return ((this.entryPrice - this.buySl()) / this.entryPrice) * 100;
    }

    tp1PercentageProfit() {
        return this.tp1Rrr * this.percentageRisk();
    }

    percentageProfit() {
        return this.tp2Rrr * this.percentageRisk();
    }

    tp1() {
        return this.entryPrice + (this.tp1PercentageProfit() * this.entryPrice / 100);
    }

    tp2() {
        return this.entryPrice + (this.percentageProfit() * this.entryPrice / 100);
    }

    tradeDetails() {
        if (this.tradeDirection !== 'buy') return null;
        return {
            time: this.signalTime,
            entry_price: this.entryPrice,
            sl: this.buySl(),
            tp1: this.tp1(),
            tp2: this.tp2(),
            direction: 'buy'
        };
    }
}

class SellTrade extends TradeSetup {
    percentageRisk() {
        return ((this.sellSl() - this.entryPrice) / this.entryPrice) * 100;
    }

    tp1() {
        const percProfit = this.tp1Rrr * this.percentageRisk();
        return this.entryPrice - (percProfit * this.entryPrice / 100);
    }

    tp2() {
        const percProfit = this.tp2Rrr * this.percentageRisk();
        return this.entryPrice - (percProfit * this.entryPrice / 100);
    }

    tradeDetails() {
        if (this.tradeDirection !== 'sell') return null;
        return {
            time: this.signalTime,
            entry_price: this.entryPrice,
            sl: this.sellSl(),
            tp1: this.tp1(),
            tp2: this.tp2(),
            direction: 'sell'
        };
    }
}

export { Scalper, UltimateSetups, TradeSetup, BuyTrade, SellTrade };

// Example usage
// const scalper = new Scalper('BTCUSDT');
// const trade = scalper.getTrade();
// console.log(trade);