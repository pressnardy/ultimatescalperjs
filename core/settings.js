
const ULTIMATE_SCALPING_SETTINGS = {
    breakout_lookback: 5,
    fo_lookback: 5,
    pivot_lookback: 30,
    default_symbol: "BTCUSDT",
    default_quantity: 500,
    stop_lose_padding: 0.0011,
    tp2_rrr: 3,
    tp1_rrr: 1.5,
    min_opposite: 2,
    trade_periods: { "30m": ["30m"], "4h": ["4h"], "1d": ["1d"] },
    symbols: ["BTCUSDT", "ETHUSDT"],
    default_period: "30m",
    signal_uptime: 30,
    max_breach: 4,
    signal_quantity: { "5m": 180, "15m": 60, "30m": 500, "4h": 500 },
};

const ULTIMATE_SWING_SETTINGS = {
    setup_period: "4h",
    trade_period: "4h",
    pivot_lookback: 30,
    default_symbol: "BTCUSDT",
    default_quantity: 500,
    tp2_rrr: 3,
    tp1_rrr: 2,
    stop_lose_padding: 0.0011,
    symbols: ["BTCUSDT", "ETHUSDT"],
    signal_uptime: 30,
    max_breach: 4,
    fo_lookback: 5,
    signal_quantity: 500,

};

const MARKERS = {
    buy_marker: {
        position: 'belowBar',
        color: '#05dff7',
        shape: 'circle',
        text: 'Buy',
    },
    sell_marker: {
        position: 'aboveBar',
        color: '#f74e05',
        shape: 'circle',
        text: 'Sell',
    },
};

const ULTIMATE_DCA_SETTINGS = {
    timeframe: "1d",
    pivot_lookback: 90,
    tp1_rrr: 2,
    tp2_rrr: 3,
    tp3_rrr: 10,

};

const CHART_SETTINGS = {
    "pivot_types": ["high", "low"],
    "fib_levels": [0.8, 0.67, 0.618, 0.35],
    "pivots_gap": 20,
    "pivotLookback": 30,
    "fakeOutLookback": 5,
    "trendlineFibs": [0.45, 0.75],
    "rangeQuantity": 210,
    "defaultPeriod": "4h",

};

export {
    CHART_SETTINGS,
    ULTIMATE_SCALPING_SETTINGS,
    ULTIMATE_SWING_SETTINGS,
    ULTIMATE_DCA_SETTINGS,
    MARKERS,
}
