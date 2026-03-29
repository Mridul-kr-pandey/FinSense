let fireChartInst = null;
let rentChartInst = null;
let debtChartInst = null;

// Global configuration for Chart.js
Chart.defaults.color = '#a0aabf';
Chart.defaults.font.family = "'Outfit', sans-serif";

function interceptVerdicts() {
    // FIRE CHART
    const origFire = window.generateFireVerdict;
    if (origFire) {
        window.generateFireVerdict = function(data) {
            origFire(data); // Call original to update DOM text
            
            // Calculate trajectory
            let labels = [];
            let portfolioData = [];
            let targetData = [];
            
            let currentAge = parseInt(data.age);
            let retireAge = parseInt(data.retire);
            let years = retireAge - currentAge;
            if (years <= 0) years = 10; // fallback
            
            let p = parseInt(data.port);
            let sip = parseInt(data.inv);
            
            // Calculate target dynamically - inflation 6%, safe withdraw 3% (33x)
            let exp = parseInt(data.exp);
            let infExp = exp * Math.pow(1.06, years);
            let reqCorpus = (infExp * 12) * 33;

            for(let i=0; i<=years; i++) {
                labels.push('Age ' + (currentAge + i));
                portfolioData.push(p);
                targetData.push(reqCorpus);
                p = (p * 1.12) + (sip * 12 * 1.12);
            }

            const ctx = document.getElementById('fireChart');
            if(ctx) {
                if(fireChartInst) fireChartInst.destroy();
                fireChartInst = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Projected Portfolio', data: portfolioData, borderColor: '#00f2fe', backgroundColor: 'rgba(0, 242, 254, 0.1)', fill: true, tension: 0.3 },
                            { label: 'FIRE Target', data: targetData, borderColor: '#ff4b2b', borderDash: [5, 5], pointRadius: 0, tension: 0.3 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }
        };
    }

    // RENT CHART
    const origRent = window.generateRentVerdict;
    if (origRent) {
        window.generateRentVerdict = function(data) {
            origRent(data); // Call original

            let labels = [];
            let buyData = [];
            let rentData = [];
            
            let cost = parseInt(data.cost);
            let dp = parseInt(data.dp);
            let roi = parseFloat(data.roi)/100;
            let tenure = parseInt(data.tenure);
            let rent = parseInt(data.rent);
            let propApp = parseFloat(data.prop_app)/100;
            let mfRet = parseFloat(data.mf_ret)/100;

            let loanAmt = cost - dp;
            let r = roi / 12;
            let n = tenure * 12;
            let emi = (loanAmt * r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
            if (!isFinite(emi)) emi = loanAmt/n;

            let diff = emi - rent;
            
            let buyPropertyVal = cost;
            let loanRem = loanAmt;
            let rentMfVal = dp;

            for(let yr=0; yr<=tenure; yr+=Math.max(1, Math.floor(tenure/10))) {
                if(yr > tenure) yr = tenure;
                labels.push('Year ' + yr);
                
                let buyNetWorth = buyPropertyVal - loanRem;
                buyData.push(Math.round(buyNetWorth));
                rentData.push(Math.round(rentMfVal));

                // step 1 yr
                for(let m=0; m<12; m++) {
                    let interest = loanRem * r;
                    let princ = emi - interest;
                    loanRem -= princ;
                    if(loanRem < 0) loanRem = 0;
                }
                buyPropertyVal = buyPropertyVal * (1 + propApp);
                rentMfVal = rentMfVal * (1 + mfRet);
                if (diff > 0) rentMfVal += diff * 12 * Math.pow(1+mfRet, 0.5); // roughly add sip
                rent = rent * 1.05; // rent inflates 5%
                diff = emi - rent;
            }

            const ctx = document.getElementById('rentChart');
            if(ctx) {
                if(rentChartInst) rentChartInst.destroy();
                rentChartInst = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Buy Net Worth', data: buyData, borderColor: '#00e676', backgroundColor: 'rgba(0, 230, 118, 0.1)', fill: true, tension: 0.4 },
                            { label: 'Rent Net Worth', data: rentData, borderColor: '#b388ff', backgroundColor: 'rgba(179, 136, 255, 0.1)', fill: true, tension: 0.4 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }
        };
    }

    // DEBT CHART
    const origDebt = window.generateDebtVerdict;
    if (origDebt) {
        window.generateDebtVerdict = function(data) {
            origDebt(data);

            // We will plot the loan balance over time for Normal vs Fast
            let labels = [];
            let normalData = [];
            let fastData = [];

            function runSim(extra, arr) {
                let loans = [];
                if(data.l1_bal > 0) loans.push({ bal: data.l1_bal, roi: data.l1_roi, emi: data.l1_emi });
                if(data.l2_bal > 0) loans.push({ bal: data.l2_bal, roi: data.l2_roi, emi: data.l2_emi });
                
                let month = 0;
                while(true) {
                    let active = loans.filter(l => l.bal > 0);
                    let tot = active.reduce((s,l) => s+l.bal, 0);
                    if(month % 6 === 0 || tot === 0) arr.push(tot);
                    if(tot === 0 || month > 360) break;

                    active.sort((a,b) => b.roi - a.roi);
                    let avail = extra;
                    active.forEach(l => {
                        let i = l.bal * (l.roi/100/12);
                        l.bal += i;
                        let p = Math.min(l.emi, l.bal);
                        l.bal -= p;
                        if(l.emi > p) avail += (l.emi - p);
                    });

                    if(avail > 0) {
                        let unp = active.filter(l => l.bal > 0);
                        if(unp.length > 0) {
                            let chunk = Math.min(avail, unp[0].bal);
                            unp[0].bal -= chunk;
                            avail -= chunk;
                            if(avail > 0 && unp.length > 1) unp[1].bal -= Math.min(avail, unp[1].bal);
                        }
                    }
                    month++;
                }
            }

            runSim(0, normalData);
            runSim(data.extra, fastData);

            let maxLen = Math.max(normalData.length, fastData.length);
            for(let i=0; i<maxLen; i++) {
                labels.push('M' + (i * 6));
                if(i >= fastData.length && fastData.length > 0) fastData.push(0);
                if(i >= normalData.length && normalData.length > 0) normalData.push(0);
            }

            const ctx = document.getElementById('debtChart');
            if(ctx) {
                if(debtChartInst) debtChartInst.destroy();
                debtChartInst = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels,
                        datasets: [
                            { label: 'Normal Payoff Balance', data: normalData, borderColor: '#ff6b6b', tension: 0.3 },
                            { label: 'Fast Payoff Balance', data: fastData, borderColor: '#4facfe', backgroundColor: 'rgba(79, 172, 254, 0.2)', fill: true, tension: 0.3 }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }
        };
    }
}

// Ensure interception happens after script.js defines them
setTimeout(interceptVerdicts, 100);
