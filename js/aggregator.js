document.addEventListener('DOMContentLoaded', () => {
    const btnBankSync = document.getElementById('btnBankSync');
    const terminalOverlay = document.getElementById('terminalOverlay');
    const terminalContent = document.getElementById('terminalContent');

    if (!btnBankSync || !terminalOverlay || !terminalContent) return;

    const logs = [
        "> Initializing RBI Account Aggregator Tunnel...",
        "> Requesting permission from User via AA-Handle: user@onemoney",
        "> [OK] Consent Received. Fetching FIP list...",
        "> Connecting to HDFC Bank Limited...",
        "> Connecting to ICICI Bank...",
        "> Fetching Savings Account Statements (last 6 months)...",
        "> Parsing 412 transactions for patterns...",
        "> [Pattern] Salary detected: ₹1,25,000",
        "> [Pattern] Rent detected: ₹28,000",
        "> [Pattern] SIP detected: ₹25,000 (Index Funds)",
        "> [Pattern] Credit Card Debt detected: ₹42,000 (HDFC Regalia)",
        "> Calculating Money Health metrics...",
        "> Data aggregation complete. Syncing with FinSense...",
        "DONE: ALL SYSTEMS GREEN."
    ];

    async function typeLog(text) {
        return new Promise(resolve => {
            const line = document.createElement('div');
            terminalContent.appendChild(line);
            let i = 0;
            const interval = setInterval(() => {
                line.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, 20);
        });
    }

    btnBankSync.addEventListener('click', async () => {
        btnBankSync.disabled = true;
        btnBankSync.textContent = "Syncing...";
        terminalOverlay.style.display = 'flex';
        terminalContent.innerHTML = '';

        for (const log of logs) {
            await typeLog(log);
            await new Promise(r => setTimeout(r, 400));
        }

        // Mock Data Auto-fill
        document.getElementById('income').value = 125000;
        document.getElementById('expenses').value = 45000;
        document.getElementById('age').value = 28;
        document.getElementById('emergency_months').value = 4;
        document.getElementById('health_insurance').value = "Yes";
        document.getElementById('life_insurance').value = "Yes";
        document.getElementById('investments').value = "Mutual Funds";
        document.getElementById('tax_saving').value = "Yes";
        document.getElementById('debt').value = "Yes";
        document.getElementById('emi_percentage').value = 15;

        // Auto-fill Tax Wizard too for better demo
        if(document.getElementById('tax_gross')) document.getElementById('tax_gross').value = 1500000;

        // Trigger persistence (saves to localStorage)
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        setTimeout(() => {
            terminalOverlay.style.display = 'none';
            btnBankSync.innerHTML = '<span style="font-size: 1.4rem;">✅</span> Sync Complete';
            
            // Trigger the calculation automatically
            const healthForm = document.getElementById('healthForm');
            if (healthForm) {
                healthForm.dispatchEvent(new Event('submit'));
            }

            // Optional: Alert the user
            // alert("Data successfully fetched from 2 banks!");
        }, 1000);
    });
});
