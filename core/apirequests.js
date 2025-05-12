import axios from 'axios';

async function getCandles(timeframe, quantity, symbol) {
    const url = 'https://api.binance.com/api/v3/klines';
    const params = {
        symbol: symbol,
        interval: timeframe
    };
    try {

        const response = await axios.get(url, { params });
        const candles = response.data.map(data => {
            const [openTime, openPrice, high, low, close, volume, endTime] = data;
            return {
                time: openTime,
                open: parseFloat(openPrice),
                high: parseFloat(high),
                low: parseFloat(low),
                close: parseFloat(close),
                volume: parseFloat(volume),
                end_time: endTime
            };
        });
        return candles.slice(-quantity, -1);
    } catch (error) {
        throw new Error("Error fetching candles: " + error.message);
    }
}

async function getCvdCandles(symbol, interval, startTime, endTime) {
    const baseUrl = "https://api.binance.com";
    const endpoint = "/api/v3/klines";
    const url = `${baseUrl}${endpoint}`;
    const params = {
        symbol: symbol,
        interval: interval,
        startTime: startTime,
        endTime: endTime
    };
    try {
        const response = await axios.get(url, { params });
        return response.data.map(data => {
            const [openTime, openPrice, high, low, close, volume] = data;
            return {
                open: parseFloat(openPrice),
                close: parseFloat(close),
                volume: parseFloat(volume)
            };
        });
    } catch (error) {
        throw new Error("Error fetching CVD candles: " + error.message);
    }
}

// const candles = await Promise.resolve(getCandles("1m", 100, "BTCUSDT"));
// const getResolvedCandles = Promise.resolve(candles);

export {getCandles, getCvdCandles };




