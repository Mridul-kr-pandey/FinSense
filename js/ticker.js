document.addEventListener('DOMContentLoaded', () => {
    const tickerWrapper = document.getElementById('tickerWrapper');
    if (!tickerWrapper) return;

    const marketData = [
        { id: 'nifty', label: 'NIFTY 50', value: 22453.30, delta: 125.40, pc: 0.56 },
        { id: 'sensex', label: 'SENSEX', value: 73917.15, delta: 450.20, pc: 0.61 },
        { id: 'gold', label: 'GOLD (24K)', value: 68450, delta: -210, pc: -0.31 },
        { id: 'btc', label: 'BITCOIN', value: 5842100, delta: 125400, pc: 2.19 },
        { id: 'usdinr', label: 'USD/INR', value: 83.42, delta: 0.05, pc: 0.06 }
    ];

    function renderTicker() {
        tickerWrapper.innerHTML = '';
        // Duplicate data to ensure seamless scroll
        const extendedData = [...marketData, ...marketData];
        
        extendedData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'ticker-item';
            div.id = `ticker-${item.id}`;
            const isUp = item.delta >= 0;
            
            div.innerHTML = `
                <span class="ticker-label">${item.label}</span>
                <span class="ticker-value">₹${item.value.toLocaleString('en-IN')}</span>
                <span class="ticker-delta ${isUp ? 'up' : 'down'}">
                    ${isUp ? '▲' : '▼'} ${Math.abs(item.pc).toFixed(2)}%
                </span>
            `;
            tickerWrapper.appendChild(div);
        });
    }

    function updatePrices() {
        marketData.forEach(item => {
            // Randomly fluctuate price by +/- 0.05%
            const change = (Math.random() - 0.5) * 0.001; 
            item.value = item.value * (1 + change);
            
            // Update the DOM if it exists (for the visible ones)
            // Note: Since we duplicated the list for the scroll, just re-rendering is easier for a mock
        });
        renderTicker();
    }

    renderTicker();
    // Update every 3 seconds for a "live" feel
    setInterval(updatePrices, 3000);
});
