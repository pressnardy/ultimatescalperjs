import * as strategies from '../strategies/index.js';


const containerId = "chart"
const symbol = document.getElementById("coin").value
let period = document.getElementById("period")
let setupPeriod = period.value

function convertTimes(data) {
    for (let i = 0; i < data.length; i++) {
            data[i].time = data[i].time / 1000
        }
}

function to2dp(number) {
  return Math.trunc(number * 100) / 100;
}


function timeToUtc(unixTime){
    const date = new Date(unixTime);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0"); // 24-hour format
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${year}/${month}/${day}/${hours}:${minutes}`;
}

function createChartContainer(containerId) {
    const parent = document.getElementById("chart-area")
    let div = document.createElement("div")
    div.id = containerId
    parent.appendChild(div)

}

function deleteChart(containerId) {
    const chartArea = document.getElementById("chart-area")
    let chartDiv = document.getElementById(containerId)
    if (chartDiv) {
        chartArea.removeChild(chartDiv)
    }
}

function getLineData(candles, level) {
    const lineData = []
    const timeData = candles.map(candle => candle.time);
    timeData.forEach(t => {
        if (t >= level.time) {
            lineData.push({ time: t, value: level.value });
        }
    });
    return lineData;
}


function getLines(candles, levels) {
    return levels.map(level => getLineData(candles, level));
}

function plotLevels(chart, candles, levels, levelColor){
    let targetLevels = getLines(candles, levels)

    for (let level of targetLevels) {
        const lineSeries = chart.addLineSeries({
            lineWidth: 1, priceLineVisible: false, color: levelColor,
        })
        lineSeries.setData(level)
    }

}

const chartOptions = {
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal
    },
    autoSize: true,
    width: 1000,
    height: 600,
    grid: {
    vertLines: {
      visible: true
    },
    horzLines: {
      visible: true
    }
    },
    layout: {
        // textColor: "white",
        // background: { color: '#000000', type: 'solid' },
    },
    timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#cfcfcf"
    },
    priceScale: {
        borderColor: "lightgrey"
    }
        }


async function getChartData(symbol, setup_period){
    try {
        const response = await strategies.getSetupCandles(symbol, setup_period)
        const candles = response.candles
        convertTimes(candles)
        convertTimes(response.buyLevels)
        convertTimes(response.sellLevels)
        return response
    } catch (error) {
        console.error(error)
    }
}

async function getPrevTrades(symbol, setup_period){
    try {
        const response = await strategies.getPrevTrades(symbol, setup_period)
        convertTimes(response.markers)
        return response
    } catch (error) {
        console.error(error)
    }
}

function addGridValues(grid, values) {

    for (let value of values) {
        const data_element = document.createElement("div"); // Create a new element for each data
        data_element.classList.add("data");
        data_element.innerText = value;
        grid.appendChild(data_element);
    }
}

function fillTrades(prevTrades) {
    const grid = document.getElementById("signal-data")
    for (let trade of prevTrades) {
        const values = [
            timeToUtc(trade.time), trade.direction, trade.entry_price,
            to2dp(trade.sl), to2dp(trade.tp1), to2dp(trade.tp2)
        ]
        addGridValues(grid, values)
    }
}

async function plotChart(symbol, setup_period, containerId, chartOptions){
    createChartContainer(containerId)
    const container = document.getElementById(containerId)
    const chart = LightweightCharts.createChart(container, {width: 1000,
    height: 600,
    layout: {
        background: { color: '#000000' }, // Set background color to black
        textColor: '#ffffff' // Set text color to white
    }});
    const candlestickSeries = chart.addCandlestickSeries()
    const chartData = await getChartData(symbol, setup_period)

    const candles = await chartData.candles
    const buyLevels = chartData.buyLevels
    const sellLevels = chartData.sellLevels
    candlestickSeries.setData(candles)
    plotLevels(chart, candles, buyLevels, '#05cdff')
    plotLevels(chart, candles, sellLevels, '#fc9608')

    let prevTrades = await getPrevTrades(symbol, setup_period)
    const markers = prevTrades.markers
    candlestickSeries.setMarkers(markers)
    const trades = prevTrades.prevTrades

    fillTrades(trades)

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const cr = entry.contentRect;
            chart.resize(cr.width, cr.height); // Resize the chart
        }
    });

    resizeObserver.observe(container);
}

plotChart(symbol, setupPeriod, containerId, chartOptions)


function deleteTrades(){
    const parent = document.getElementById("signal-data")
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}


const coin = document.getElementById("coin")
coin.addEventListener("change", function (){
    deleteChart(containerId)
    deleteTrades()
    const symbol = document.getElementById("coin").value
    const setupPeriod = document.getElementById("period").value
    plotChart(symbol, setupPeriod, containerId, chartOptions)

})


period.addEventListener("change", () => {
    deleteChart(containerId)
    deleteTrades()
    const symbol = document.getElementById("coin").value
    const setupPeriod = document.getElementById("period").value
    plotChart(symbol, setupPeriod, containerId, chartOptions)
})


