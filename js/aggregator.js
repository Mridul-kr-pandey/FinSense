document.addEventListener('DOMContentLoaded', () => {
    const btnBankSync = document.getElementById('btnBankSync');
    const terminalOverlay = document.getElementById('terminalOverlay');
    const terminalContent = document.getElementById('terminalContent');

    if (!btnBankSync || !terminalOverlay || !terminalContent) return;

    const logs = [
        { text: "> Initializing Secure Handshake with RBI AA Framework...", delay: 500 },
        { text: "> Encrypting Tunnel (AES-256)... DONE", delay: 800 },
        { text: "> Connecting to HDFC Bank API Node...", delay: 600 },
        { text: "> Requesting consent for 'FinSense AI'...", delay: 700 },
        { text: "> Consent Approved (Token: AA_982x_JSL)...", delay: 500 },
        { text: "> Fetching Savings Account Data (last 6 months)...", delay: 900 },
        { text: "> Found 422 transactions. Analyzing patterns...", delay: 1000 },
        { text: "> Scanning Credit Card Statements (ICICI, AMEX)...", delay: 800 },
        { text: "> Fetching Investment Portfolio (CAMS/KFintech)...", delay: 1100 },
        { text: "> Calculating average monthly breakdown...", delay: 700 },
        { text: "> Sync Complete! Populating Dashboard...", delay: 500 }
    ];

    async function runTerminal() {
        terminalOverlay.style.display = 'flex';
        terminalContent.innerHTML = '';
        
        for (const log of logs) {
            const line = document.createElement('div');
            line.style.marginBottom = '8px';
            terminalContent.appendChild(line);
            
            // Typewriter effect for each line
            for (let i = 0; i < log.text.length; i++) {
                line.textContent += log.text[i];
                await new Promise(r => setTimeout(r, 20));
            }
            
            await new Promise(r => setTimeout(r, log.delay));
        }

        setTimeout(() => {
            closeTerminalAndFill();
        }, 1000);
    }

    function closeTerminalAndFill() {
        terminalOverlay.style.display = 'none';
        
        // Mock Data to Fill
        const mockData = {
            'age': 29,
            'income': 125000,
            'expenses': 48500,
            'emergency_months': 5,
            'emi_percentage': 15,
            'tax_gross': 1500000,
            'tax_hra': 120000,
            'tax_80c': 150000,
            'tax_80d': 25000,
            'leak_amt': 2500
        };

        // Fill inputs
        for (const [id, value] of Object.entries(mockData)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                // Dispatch input event for persistence.js to pick up
                el.dispatchEvent(new Event('input', { bubbles: true }));
                // Visual feedback
                el.style.borderColor = '#00e676';
                el.style.boxShadow = '0 0 10px rgba(0, 230, 118, 0.3)';
                setTimeout(() => {
                    el.style.borderColor = '';
                    el.style.boxShadow = '';
                }, 2000);
            }
        }

        // Trigger major calculations if they exist in global scope
        const healthForm = document.getElementById('healthForm');
        if (healthForm) {
            healthForm.dispatchEvent(new Event('submit', { cancelable: true }));
        }

        alert("Success! 🏦 Data synchronized from your bank accounts using Account Aggregator.");
    }

    btnBankSync.addEventListener('click', runTerminal);
});
