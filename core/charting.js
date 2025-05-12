import * as pivots from './pivots.js';
import * as settings  from './settings.js';
import * as util from './util.js';
import * as apirequests from './apirequests.js';


class Chart {
    constructor(candles) {
        this._candles = candles;
        this._pivotLookback = settings.CHART_SETTINGS.pivotLookback;
        this._rangeQuantity = settings.CHART_SETTINGS.rangeQuantity;
    }

    get rangeQuantity() {
        return this._rangeQuantity;
    }

    setRangeQuantity(quantity) {
        if (Number.isInteger(quantity)) {
            this._rangeQuantity = quantity;
        } else {
            throw new Error("The 'quantity' value should be an integer");
        }
    }

    setPivotLookback(lookback) {
        if (!Number.isInteger(lookback)) {
            throw new Error("The 'lookback' value must be an integer");
        }
        this._pivotLookback = lookback;
    }

    lows() {
        const candles = this._candles.slice(-this.rangeQuantity);
        const supports = pivots.getLows(candles, this._pivotLookback);
        return util.lowsToLevels(supports);
    }

    highs() {
        const candles = this._candles.slice(-this.rangeQuantity);
        const resistancePivots = pivots.getHighs(candles, this._pivotLookback);
        return util.highsToLevels(resistancePivots);
    }

    allHighs() {
        const candles = this._candles.slice(-this.rangeQuantity);
        const resistancePivots = pivots.getResistancePivots(candles, this._pivotLookback);
        return util.highsToLevels(resistancePivots);
    }

    allLows() {
        const candles = this._candles.slice(-this.rangeQuantity);
        const supports = pivots.getSupportPivots(candles, this._pivotLookback);
        return util.lowsToLevels(supports);
    }

    static startChart(candles, rangeQuantity, pivotLookback) {
        const chart = new Chart(candles);
        chart.setPivotLookback(pivotLookback);
        chart.setRangeQuantity(rangeQuantity);
        return chart;
    }

    static async getCandles(timeframe = settings.TIMEFRAMES.default, quantity = settings.CHART_SETTINGS.range_quantity, symbol = settings.SYMBOLS.bitcoin) {
        const candles = await apirequests.getCandles(timeframe, quantity, symbol);
        return new Chart(candles);
    }
}

export default Chart;
