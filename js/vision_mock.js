document.addEventListener('DOMContentLoaded', () => {
    const form16Input = document.getElementById('form16');
    const visionOverlay = document.getElementById('visionOverlay');
    const visionStatus = document.getElementById('visionStatus');

    if (!form16Input || !visionOverlay || !visionStatus) return;

    form16Input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            startVisionScan();
        }
    });

    async function startVisionScan() {
        visionOverlay.style.display = 'flex';
        visionStatus.textContent = "AI Scanning Form 16...";
        
        // Step 1: Scanning
        await new Promise(r => setTimeout(r, 2000));
        visionStatus.textContent = "Decoding Salary Structures...";
        
        // Step 2: Extracting
        await new Promise(r => setTimeout(r, 1500));
        visionStatus.textContent = "Verifying Compliance (Section 80C)...";
        
        // Step 3: Completion
        await new Promise(r => setTimeout(r, 1500));
        
        // Mock Data Auto-fill
        document.getElementById('tax_gross').value = 1600000;
        document.getElementById('tax_hra').value = 95000;
        document.getElementById('tax_80c').value = 150000;
        document.getElementById('tax_80d').value = 25000;
        
        // Trigger persistence (saves to localStorage)
        const inputs = document.querySelectorAll('#taxForm input, #taxForm select');
        inputs.forEach(input => {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });

        visionStatus.textContent = "Extraction Successful!";
        visionStatus.style.color = "#00e676";

        setTimeout(() => {
            visionOverlay.style.display = 'none';
            visionStatus.style.color = "#fff"; // reset for next time
            
            // Trigger the tax calculation automatically
            const taxForm = document.getElementById('taxForm');
            if (taxForm) {
                taxForm.dispatchEvent(new Event('submit'));
            }
        }, 8000);
    }
});
