function adjustTimeScale(chart) {
    const timeScale = chart.timeScale();
    timeScale.setVisibleLogicalRange({ from: -500, to: 0 });
    timeScale.applyOptions({ rightOffset: 5 })
}

const legendHTML = '<div class="legend"><span class="legend-item buy">Buy</span><span class="legend-item sell">Sell</span></div>';




export { adjustTimeScale };

