// Translated from base_candle.py
class Candle {
    constructor(candleData) {
        this._candle = candleData;
        this._fib = 0.618; // Default Fibonacci value, replace with settings if needed
        Object.assign(this, candleData);
    }

    setPinbarFib(pinbarFib) {
        this._fib = pinbarFib;
    }

    bodySize() {
        return this.close - this.open;
    }

    size() {
        return this.high - this.low;
    }

    midBody() {
        return this.bodySize() / 2 + this.open;
    }

    isBullish() {
        return this.close > this.open;
    }

    isBearish() {
        return this.open > this.close;
    }

    isShootingStar() {
        return this.low + this._fib * this.size() > Math.max(this.open, this.close);
    }

    isHammer() {
        return this.high - (this._fib * this.size()) < Math.min(this.open, this.close);
    }

    isGreenPinbar() {
        return this.isBullish() && this.isHammer();
    }

    isRedPinbar() {
        return this.isShootingStar() && this.isBearish();
    }

    isStrongBreakout(level) {
        return (this.bodySize() / 2) + this.open > level && level > this.low;
    }

    isStrongBreakdown(level) {
        return this.open - (this.bodySize() / 2) < level;
    }

    candleIndex(candles) {
        const index = candles.indexOf(this);
        if (index === -1) {
            throw new Error("Candle not in the candles array");
        }
        return index;
    }
}


export default Candle ;
