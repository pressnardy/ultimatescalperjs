function adjustTimeScale(chart) {
    const timeScale = chart.timeScale();
    timeScale.setVisibleLogicalRange({ from: -500, to: 0 });
    timeScale.applyOptions({ rightOffset: 5 })
}

// Example usage:
// const chart = LightweightCharts.createChart(document.body, chartOptions);



export { adjustTimeScale };