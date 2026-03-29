// Translation Engine (lang.js contains the i18n object)
let currentLang = 'en';
let currentHealthData = null; 
let currentTaxData = null;
let currentCoupleData = null;
let currentFireData = null;
let currentLifeData = null;
let currentRentData = null;
let currentDebtData = null;
let currentGoldData = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------
    // MOBILE MENU & SIDEBAR
    // ----------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const sidebar = document.querySelector('.sidebar');
    
    function toggleMobileMenu() {
        if(sidebar && mobileOverlay) {
            sidebar.classList.toggle('open');
            mobileOverlay.classList.toggle('open');
            mobileMenuBtn.innerHTML = sidebar.classList.contains('open') ? '✕' : '☰';
        }
    }
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', toggleMobileMenu);

    // ----------------------------------------
    // TAB NAVIGATION
    // ----------------------------------------
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
            if(window.innerWidth < 992 && sidebar && sidebar.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ----------------------------------------
    // LIGHT/DARK MODE TOGGLE
    // ----------------------------------------
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            themeToggle.innerText = isLight ? '🌙' : '☀️';
            if (currentHealthData) {
                updateStatusBadge(currentHealthData.score);
            }
        });
    }

    // ----------------------------------------
    // LANGUAGE SELECTOR
    // ----------------------------------------
    const langSelect = document.getElementById('lang_select');
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateUITranslations();
        
        // Re-render open reports
        if (currentHealthData) { 
            generateReport(currentHealthData.score, currentHealthData.data); 
            updateStatusBadge(currentHealthData.score); 
        }
        if (currentTaxData) { 
            generateTaxVerdict(currentTaxData); 
        }
        if (currentCoupleData) { 
            generateCoupleVerdict(currentCoupleData); 
        }
        if (currentFireData) { 
            generateFireVerdict(currentFireData); 
        }
        if (currentLifeData) { 
            generateLifeVerdict(currentLifeData); 
        }
        if (currentRentData) {
            generateRentVerdict(currentRentData);
        }
        if (currentDebtData) {
            generateDebtVerdict(currentDebtData);
        }
        if (currentGoldData) {
            generateGoldVerdict(currentGoldData);
        }
    });
    updateUITranslations();

    // ----------------------------------------
    // TAB 1: MONEY HEALTH SCORE
    // ----------------------------------------
    const healthForm = document.getElementById('healthForm');
    const resultCard = document.getElementById('resultCard');
    const resetBtn = document.getElementById('resetBtn');
    const circle = document.querySelector('.progress-ring__circle');
    
    if(circle){
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;
        circle.setProgress = function(percent) {
            circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        };
    }

    healthForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const age = parseInt(document.getElementById('age').value);
        const income = parseInt(document.getElementById('income').value);
        const expenses = parseInt(document.getElementById('expenses').value);
        const savings = income - expenses;
        const emergency_months = parseInt(document.getElementById('emergency_months').value);
        const health_insurance = document.getElementById('health_insurance').value === 'Yes';
        const life_insurance = document.getElementById('life_insurance').value === 'Yes';
        const investments = document.getElementById('investments').value;
        const hasDebt = document.getElementById('debt').value === 'Yes';
        const emi_percentage = parseInt(document.getElementById('emi_percentage').value) || 0;
        const tax_saving = document.getElementById('tax_saving').value === 'Yes';

        if (income <= 0 || expenses < 0) return alert("Please enter valid numbers");

        let score = 0;
        if (emergency_months >= 6) score += 20; else if (emergency_months >= 3) score += 10; else if (emergency_months >= 1) score += 5;
        if (health_insurance) score += 8;
        if (life_insurance) score += 7;
        if (investments === 'Stocks' || investments === 'Mutual Funds') score += 20; else if (investments === 'FD') score += 10;
        if (!hasDebt || emi_percentage === 0) score += 15; else if (emi_percentage <= 20) score += 10; else if (emi_percentage <= 40) score += 5;
        const sRate = income > 0 ? (savings / income) * 100 : 0;
        if (sRate >= 30) score += 15; else if (sRate >= 15) score += 10; else if (sRate > 0) score += 5;
        if (tax_saving) score += 15; else score += 5;
        
        currentHealthData = { score, data: { age, income, expenses, savings, emergency_months, health_insurance, life_insurance, investments, hasDebt, emi_percentage } };

        updateStatusBadge(score);
        generateReport(score, currentHealthData.data);

        resultCard.classList.remove('hidden');
        resultCard.classList.add('active');
        setTimeout(() => circle.setProgress(score), 100);
        if (window.innerWidth < 992) setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    resetBtn.addEventListener('click', () => {
        resultCard.classList.remove('active');
        setTimeout(() => { resultCard.classList.add('hidden'); circle.setProgress(0); }, 400);
        currentHealthData = null; window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if(downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const isLight = document.body.classList.contains('light-mode');
            const bgHex = isLight ? '#f4f6f9' : '#0c0f1a';
            const opt = {
                margin:       10,
                filename:     'FinSense_ActionPlan.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, backgroundColor: bgHex },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'p' }
            };
            
            // Hide buttons while capturing
            resetBtn.style.display = 'none';
            downloadPdfBtn.style.display = 'none';
            
            // Fix html2canvas backdrop-filter bug by applying solid background temporarily
            const originalBackdrop = resultCard.style.backdropFilter;
            const originalWebkitBackdrop = resultCard.style.webkitBackdropFilter;
            const originalBg = resultCard.style.background;
            
            resultCard.style.backdropFilter = 'none';
            resultCard.style.webkitBackdropFilter = 'none';
            resultCard.style.background = isLight ? '#ffffff' : '#141928';
            
            html2pdf().set(opt).from(resultCard).save().then(() => {
                resetBtn.style.display = 'block';
                downloadPdfBtn.style.display = 'flex';
                // Restore styles
                resultCard.style.backdropFilter = originalBackdrop;
                resultCard.style.webkitBackdropFilter = originalWebkitBackdrop;
                resultCard.style.background = originalBg;
            });
        });
    }


    // ----------------------------------------
    // TAB 2: TAX WIZARD
    // ----------------------------------------
    const form16Input = document.getElementById('form16');
    const form16UploadBtn = document.getElementById('form16UploadBtn');

    const taxForm = document.getElementById('taxForm');

    taxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const gross = parseInt(document.getElementById('tax_gross').value) || 0;
        const hra = parseInt(document.getElementById('tax_hra').value) || 0;
        const c80 = Math.min(parseInt(document.getElementById('tax_80c').value) || 0, 150000);
        const d80 = Math.min(parseInt(document.getElementById('tax_80d').value) || 0, 75000);
        const hl = Math.min(parseInt(document.getElementById('tax_hl').value) || 0, 200000);
        const nps = Math.min(parseInt(document.getElementById('tax_nps').value) || 0, 50000);
        const oth = parseInt(document.getElementById('tax_oth').value) || 0;

        let sd = 50000; 
        
        // Old Regime Calculation
        let oldNet = gross - sd - hra - c80 - d80 - hl - nps - oth;
        let oldTax = 0;
        if(oldNet > 500000) {
            if(oldNet > 1000000) { oldTax += (oldNet - 1000000)*0.3; oldNet = 1000000; }
            if(oldNet > 500000) { oldTax += (oldNet - 500000)*0.2; oldNet = 500000; }
            if(oldNet > 250000) { oldTax += (oldNet - 250000)*0.05; }
        }
        oldTax = oldTax * 1.04;

        // New Regime Calculation
        let newNet = gross - sd;
        let newTax = 0;
        if(newNet > 700000) { 
            let rem = newNet;
            if (rem > 1500000) { newTax += (rem - 1500000) * 0.3; rem = 1500000; }
            if (rem > 1200000) { newTax += (rem - 1200000) * 0.2; rem = 1200000; }
            if (rem > 1000000) { newTax += (rem - 1000000) * 0.15; rem = 1000000; }
            if (rem > 700000) { newTax += (rem - 700000) * 0.1; rem = 700000; }
            if (rem > 300000) { newTax += (rem - 300000) * 0.05; }
        }
        newTax = newTax * 1.04;

        currentTaxData = { oldTax, newTax, gross, hra, c80, d80, nps };
        generateTaxVerdict(currentTaxData);
        
        const taxResultCard = document.getElementById('taxResultCard');
        taxResultCard.classList.remove('hidden');
        taxResultCard.classList.add('active');
        taxResultCard.scrollIntoView({ behavior: 'smooth' });
    });


    // ----------------------------------------
    // TAB 3: COUPLE PLANNER
    // ----------------------------------------
    const coupleForm = document.getElementById('coupleForm');
    
    coupleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            p1Inc: parseInt(document.getElementById('p1_income').value) || 0,
            p1_80c: document.getElementById('p1_80c').value === 'Yes',
            p1Hl: parseInt(document.getElementById('p1_hl').value) || 0,
            p2Inc: parseInt(document.getElementById('p2_income').value) || 0,
            p2_80c: document.getElementById('p2_80c').value === 'Yes',
            p2Hl: parseInt(document.getElementById('p2_hl').value) || 0,
            jointSip: parseInt(document.getElementById('joint_sip').value) || 0
        };
        currentCoupleData = data;
        generateCoupleVerdict(data);
        
        const coupleResultCard = document.getElementById('coupleResultCard');
        coupleResultCard.classList.remove('hidden');
        coupleResultCard.classList.add('active');
        coupleResultCard.scrollIntoView({ behavior: 'smooth' });
    });

    // ----------------------------------------
    // TAB 4: FIRE PLANNER
    // ----------------------------------------
    const fireForm = document.getElementById('fireForm');
    if (fireForm) {
        fireForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                age: parseInt(document.getElementById('fire_age').value) || 0,
                retire: parseInt(document.getElementById('fire_retire').value) || 0,
                exp: parseInt(document.getElementById('fire_exp').value) || 0,
                port: parseInt(document.getElementById('fire_port').value) || 0,
                sip: parseInt(document.getElementById('fire_inv').value) || 0
            };
            if (data.retire <= data.age) return alert("Retirement age must be greater than current age.");
            currentFireData = data;
            generateFireVerdict(data);
            
            const fireResultCard = document.getElementById('fireResultCard');
            fireResultCard.classList.remove('hidden');
            fireResultCard.classList.add('active');
            fireResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ----------------------------------------
    // TAB 5: LIFE EVENT ADVISOR
    // ----------------------------------------
    const lifeForm = document.getElementById('lifeForm');
    if (lifeForm) {
        lifeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                event: document.getElementById('life_event').value,
                amt: parseInt(document.getElementById('life_amt').value) || 0
            };
            currentLifeData = data;
            generateLifeVerdict(data);
            
            const lifeResultCard = document.getElementById('lifeResultCard');
            lifeResultCard.classList.remove('hidden');
            lifeResultCard.classList.add('active');
            lifeResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ----------------------------------------
    // TAB 6: RENT VS BUY SIMULATOR
    // ----------------------------------------
    const rentForm = document.getElementById('rentForm');
    if (rentForm) {
        rentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                cost: parseFloat(document.getElementById('rent_cost').value) || 0,
                dp: parseFloat(document.getElementById('rent_dp').value) || 0,
                roi: parseFloat(document.getElementById('rent_roi').value) || 8.5,
                tenure: parseInt(document.getElementById('rent_tenure').value) || 20,
                rent: parseFloat(document.getElementById('rent_rent').value) || 0,
                propApp: parseFloat(document.getElementById('rent_prop_app').value) || 5,
                mfRet: parseFloat(document.getElementById('rent_mf_ret').value) || 12
            };
            currentRentData = data;
            generateRentVerdict(data);
            
            const rentResultCard = document.getElementById('rentResultCard');
            rentResultCard.classList.remove('hidden');
            rentResultCard.classList.add('active');
            rentResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ----------------------------------------
    // TAB 7: DEBT ERASER
    // ----------------------------------------
    const debtForm = document.getElementById('debtForm');
    if (debtForm) {
        debtForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                l1_bal: parseFloat(document.getElementById('d1_bal').value) || 0,
                l1_roi: parseFloat(document.getElementById('d1_roi').value) || 0,
                l1_emi: parseFloat(document.getElementById('d1_emi').value) || 0,
                l2_bal: parseFloat(document.getElementById('d2_bal').value) || 0,
                l2_roi: parseFloat(document.getElementById('d2_roi').value) || 0,
                l2_emi: parseFloat(document.getElementById('d2_emi').value) || 0,
                extra: parseFloat(document.getElementById('debt_extra').value) || 0
            };
            currentDebtData = data;
            generateDebtVerdict(data);
            
            const debtResultCard = document.getElementById('debtResultCard');
            debtResultCard.classList.remove('hidden');
            debtResultCard.classList.add('active');
            debtResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ----------------------------------------
    // TAB 8: GOLD ANALYZER
    // ----------------------------------------
    const goldForm = document.getElementById('goldForm');
    if (goldForm) {
        goldForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                port: parseFloat(document.getElementById('gold_port').value) || 0,
                phys: parseFloat(document.getElementById('gold_phys').value) || 0,
                sgb: parseFloat(document.getElementById('gold_sgb').value) || 0
            };
            currentGoldData = data;
            generateGoldVerdict(data);
            
            const goldResultCard = document.getElementById('goldResultCard');
            goldResultCard.classList.remove('hidden');
            goldResultCard.classList.add('active');
            goldResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // ----------------------------------------
    // TAB 9: AI BUDGETIZER
    // ----------------------------------------
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inc = parseInt(document.getElementById('bud_inc').value) || 0;
            const needs = parseInt(document.getElementById('bud_needs').value) || 0;
            const wants = parseInt(document.getElementById('bud_wants').value) || 0;
            
            if (inc <= 0) return alert("Income must be > 0");
            
            let savingsText = inc - needs - wants;
            let currentNeeds = needs;
            let currentWants = wants;
            
            // Allow negative savings
            const pctNeeds = Math.round((currentNeeds / inc) * 100);
            const pctWants = Math.round((currentWants / inc) * 100);
            const pctSav = 100 - pctNeeds - pctWants;
            
            const nDisplay = Math.min(100, pctNeeds);
            const wDisplay = Math.min(100 - nDisplay, pctWants);
            const wEnd = nDisplay + Math.max(0, wDisplay);
            
            document.getElementById('pctNeeds').innerText = pctNeeds + "%" + (pctNeeds > 50 ? " (High ⚠️)" : "");
            document.getElementById('pctWants').innerText = pctWants + "%" + (pctWants > 30 ? " (High ⚠️)" : "");
            document.getElementById('pctSavings').innerText = pctSav + "%" + (pctSav < 20 ? " (Low ⚠️)" : "");
            
            const pie = document.getElementById('budgetPie');
            pie.style.background = `conic-gradient(#4facfe 0% ${nDisplay}%, #b388ff ${nDisplay}% ${wEnd}%, #00e676 ${wEnd}% 100%)`;
            
            let adv = (i18n[currentLang].bud_adv_good) || "Great job! Your budget is perfectly aligned with the ideal 50/30/20 rule.";
            if (pctNeeds > 55) adv = (i18n[currentLang].bud_adv_needs) || "Your fixed expenses (Needs) are too high! Try to reduce rent or EMIs to bring it under 50%.";
            else if (pctWants > 35) adv = (i18n[currentLang].bud_adv_wants) || "You are overspending on lifestyle choices (Wants). Cut back on dining out or shopping to boost your savings.";
            else if (pctSav < 20) adv = (i18n[currentLang].bud_adv_sav) || "Your savings are dangerously below the 20% minimum threshold. Consider automating your SIPs strictly on salary day.";
            
            document.getElementById('budgetAdvice').innerText = adv;
            
            const budgetResultCard = document.getElementById('budgetResultCard');
            budgetResultCard.classList.remove('hidden');
            budgetResultCard.classList.add('active');
            budgetResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // ----------------------------------------
    // TAB 10: WEALTH LEAK FINDER
    // ----------------------------------------
    const leakForm = document.getElementById('leakForm');
    if (leakForm) {
        leakForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amt = parseInt(document.getElementById('leak_amt').value) || 0;
            
            if (amt <= 0) return alert("Enter an amount > 0");
            
            const months = 120;
            const r = 0.01; 
            const futureValue = amt * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
            
            const leakCostEl = document.getElementById('leakCostValue');
            animateNumber(leakCostEl, 0, Math.round(futureValue), 1000);
            
            setTimeout(() => {
                leakCostEl.innerText = "₹" + Math.round(futureValue).toLocaleString();
            }, 1050); 

            let adv = (i18n[currentLang].leak_adv_msg) || `Wow. Your ₹${amt.toLocaleString()} monthly expense could have turned into ₹${Math.round(futureValue).toLocaleString()} in Index Funds over 10 years. Time to reconsider some subscriptions?`;
            document.getElementById('leakAdvice').innerText = adv;
            
            const leakResultCard = document.getElementById('leakResultCard');
            leakResultCard.classList.remove('hidden');
            leakResultCard.classList.add('active');
            leakResultCard.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // ----------------------------------------
    // CHATBOT ASSISTANT
    // ----------------------------------------
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    if(chatbotToggle && chatbotWindow) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('hidden');
        });
        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.add('hidden');
        });

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${sender}`;
            msgDiv.innerHTML = `<div class="msg-content">${text}</div>`;
            chatbotMessages.appendChild(msgDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }

        function showTyping() {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message bot typing-msg`;
            msgDiv.innerHTML = `<div class="msg-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
            chatbotMessages.appendChild(msgDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            return msgDiv;
        }

        function botReply(text) {
            const typing = showTyping();
            setTimeout(() => {
                typing.remove();
                addMessage(text, 'bot');
            }, 1200 + Math.random() * 800);
        }

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if(!text) return;
            addMessage(text, 'user');
            chatInput.value = '';
            
            const lowerText = text.toLowerCase();
            let reply = (i18n[currentLang].chat_resp_default) || "I am analyzing your finances... Please consult an expert for specific questions!";
            if(lowerText.includes('car')) reply = (i18n[currentLang].chat_resp_car) || "Cars are depreciating assets. Follow the 20/4/10 rule: 20% down payment, 4-year loan term, and EMI under 10% of monthly income!";
            else if(lowerText.includes('tax')) reply = (i18n[currentLang].chat_resp_tax) || "Maximize your 80C (₹1.5L) and 80D (Health Insurance). Try our Tax Wizard tab to calculate exactly Old vs New regime!";
            else if(lowerText.includes('raise') || lowerText.includes('hike') || lowerText.includes('bonus')) reply = (i18n[currentLang].chat_resp_raise) || "Awesome! Increase your SIPs by exactly the same percentage of your raise to avoid lifestyle inflation.";
            
            botReply(reply);
        });

        quickReplyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.innerText;
                addMessage(text, 'user');
                const type = btn.getAttribute('data-type');
                let reply = "";
                if(type === "1") reply = (i18n[currentLang].chat_resp_raise) || "Awesome! Increase your SIPs by exactly the same percentage of your raise to avoid lifestyle inflation.";
                else if(type === "2") reply = (i18n[currentLang].chat_resp_car) || "Cars are depreciating assets. Follow the 20/4/10 rule: 20% down payment, 4-year loan term, and EMI under 10% of monthly income!";
                else if(type === "3") reply = (i18n[currentLang].chat_resp_tax) || "Maximize your 80C (₹1.5L) and 80D (Health Insurance). Try our Tax Wizard tab to calculate exactly Old vs New regime!";
                botReply(reply);
            });
        });
    }
});

// ----------------------------------------
// GLOBAL RENDER HELPERS
// ----------------------------------------

function updateUITranslations() {
    const t = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.type === 'button') el.value = t[key];
            else el.innerHTML = t[key];
        }
    });
}

function animateNumber(element, start, end, duration) {
    if (!element) return;
    const range = end - start;
    if (range === 0) {
        element.textContent = end;
        return;
    }
    let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        element.textContent = Math.floor(progress * range + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end;
        }
    }
    window.requestAnimationFrame(step);
}

function updateStatusBadge(score) {
    const badge = document.getElementById('statusBadge');
    const t = i18n[currentLang];
    const circle = document.querySelector('.progress-ring__circle');
    const scoreValEl = document.getElementById('scoreValue');
    
    let statusClass = "status-poor"; let statusText = t.status_poor; let color = "#ff5252"; 
    if (score > 70) { statusClass = "status-good"; statusText = t.status_good; color = "#00e676"; } 
    else if (score > 40) { statusClass = "status-average"; statusText = t.status_average; color = "#ffb74d"; }

    if(circle) {
        circle.style.stroke = color;
        circle.style.filter = `drop-shadow(0 0 10px ${color}80)`;
    }
    
    scoreValEl.style.color = color;
    scoreValEl.style.textShadow = `0 0 15px ${color}80`;
    
    let startVal = parseInt(scoreValEl.textContent) || 0;
    animateNumber(scoreValEl, startVal, score, 800);
    
    badge.textContent = statusText;
    badge.className = `status-badge ${statusClass}`;
}

function generateReport(score, data) {
    const t = i18n[currentLang];
    
    // Summary
    let summary = t.rep_sum_poor;
    if (score > 70) summary = t.rep_sum_good; else if (score > 40) summary = t.rep_sum_avg;
    if (data.savings < 0) summary = t.rep_sum_alert;
    document.getElementById('resSummary').textContent = summary;

    // Problems
    let probs = [];
    if (!data.health_insurance) probs.push(t.rep_prob_health);
    if (!data.life_insurance) probs.push(t.rep_prob_life);
    if (data.emergency_months < 3) probs.push(t.rep_prob_em.replace('{m}', data.emergency_months));
    if (data.investments === 'None' || data.investments === 'FD') probs.push(t.rep_prob_inv);
    if (data.emi_percentage >= 40) probs.push(t.rep_prob_emi.replace('{p}', data.emi_percentage));
    if (probs.length === 0) probs.push(t.rep_prob_none);
    document.getElementById('resProblems').innerHTML = probs.map(p => `<li>${p}</li>`).join('');

    // Actions
    let acts = [];
    if (!data.health_insurance) acts.push(t.rep_act_health);
    if (!data.life_insurance) acts.push(t.rep_act_life);
    if (data.emergency_months < 6) acts.push(t.rep_act_em.replace('{amt}', (Math.max(0, data.expenses) * 6).toLocaleString()));
    if (data.emi_percentage > 20) acts.push(t.rep_act_emi);
    if (data.savings > 0 && (data.investments === 'None' || data.investments === 'FD')) acts.push(t.rep_act_inv);
    if (acts.length === 0) acts.push(t.rep_act_none);
    document.getElementById('resAction').innerHTML = acts.map(a => `<li>${a}</li>`).join('');

    // Investments
    let invText = ""; let pSip = Math.max(0, data.savings - Math.round(data.income * 0.1));
    if (data.savings <= 0) invText = t.rep_inv_debt;
    else if (pSip >= 5000) invText = t.rep_inv_good.replace('{sip}', pSip.toLocaleString()).replace('{n50}', Math.round(pSip*0.5).toLocaleString()).replace('{flexi}', Math.round(pSip*0.3).toLocaleString()).replace('{small}', Math.round(pSip*0.2).toLocaleString());
    else invText = t.rep_inv_basic.replace('{sav}', data.savings.toLocaleString()).replace('{amt}', Math.max(500, Math.round(data.savings/2)).toLocaleString());
    document.getElementById('resInvest').textContent = invText;

    // Tips
    document.getElementById('resEmergency').textContent = t.rep_em_adv.replace('{exp}', data.expenses.toLocaleString()).replace('{tgt}', (data.expenses*6 > 0 ? data.expenses*6 : 0).toLocaleString());
    let tipAmount = pSip > 3000 ? pSip : 5000;
    document.getElementById('resTip').textContent = t.rep_tip.replace('{sip}', tipAmount.toLocaleString()).replace('{val}', Math.round(tipAmount * 120 * 3.5).toLocaleString());
}

function generateTaxVerdict({ oldTax, newTax, gross, hra, c80, d80, nps }) {
    const t = i18n[currentLang];
    
    document.getElementById('oldTaxValue').textContent = `₹${Math.round(oldTax).toLocaleString()}`;
    document.getElementById('newTaxValue').textContent = `₹${Math.round(newTax).toLocaleString()}`;
    
    const oldBox = document.getElementById('oldRegBox');
    const newBox = document.getElementById('newRegBox');
    oldBox.classList.remove('winner'); newBox.classList.remove('winner');

    let diff = Math.abs(oldTax - newTax);
    let strDiff = Math.round(diff).toLocaleString();
    let verdict = "";
    
    if (oldTax < newTax) {
        oldBox.classList.add('winner');
        verdict = t.tax_verd_old.replace('{diff}', strDiff);
    } else if (newTax < oldTax) {
        newBox.classList.add('winner');
        verdict = t.tax_verd_new.replace('{diff}', strDiff);
    } else {
        verdict = t.tax_verd_same;
    }
    document.getElementById('taxVerdict').innerHTML = verdict;

    let advice = [];
    if (c80 < 150000) advice.push(t.tax_adv_80c.replace('{diff}', (150000 - c80).toLocaleString()));
    if (nps === 0) advice.push(t.tax_adv_nps);
    if (d80 < 25000) advice.push(t.tax_adv_80d);
    if (gross > 1000000 && hra < 50000 && oldTax < newTax) advice.push(t.tax_adv_hra);
    if (advice.length === 0) advice.push(t.tax_adv_opt);

    document.getElementById('taxAdviceList').innerHTML = advice.map(a => `<li style="margin-bottom:8px;">${a}</li>`).join('');
}

function generateCoupleVerdict({ p1Inc, p1_80c, p1Hl, p2Inc, p2_80c, p2Hl, jointSip }) {
    const t = i18n[currentLang];
    
    const getSlab = (inc) => {
        if (inc > 1500000) return 30;
        if (inc > 1000000) return 20;
        if (inc > 700000) return 10;
        return 0;
    };
    let p1Slab = getSlab(p1Inc);
    let p2Slab = getSlab(p2Inc);

    let adv = [];
    
    // 1. Home Loan logic
    let hlTotal = p1Hl + p2Hl;
    if (hlTotal > 0) {
        let higherP = p1Slab > p2Slab ? t.prt_a : p2Slab > p1Slab ? t.prt_b : t.prt_eith;
        if (p1Slab !== p2Slab) {
            adv.push(t.cpl_adv_arb.replace(/\{p\}/g, higherP).replace('{slab}', Math.max(p1Slab, p2Slab)));
        } else {
            if(hlTotal > 200000) adv.push(t.cpl_adv_joint);
        }
    }

    // 2. 80C Logic
    if (!p1_80c && p1Slab > 0) adv.push(t.cpl_adv_80ca);
    if (!p2_80c && p2Slab > 0) adv.push(t.cpl_adv_80cb);

    // 3. Health Insurance
    adv.push(t.cpl_adv_hi);

    // 4. Joint SIPs
    if (jointSip > 0) {
        let lowerP = p1Slab < p2Slab ? t.prt_a : p2Slab < p1Slab ? t.prt_b : t.prt_both;
        if (p1Slab !== p2Slab) {
            adv.push(t.cpl_adv_book.replace('{sip}', jointSip.toLocaleString()).replace('{p}', lowerP).replace('{slab}', Math.min(p1Slab,p2Slab)));
        } else {
            adv.push(t.cpl_adv_split.replace('{sip}', jointSip.toLocaleString()));
        }
    }

    document.getElementById('coupleAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}

function generateFireVerdict({ age, retire, exp, port, sip }) {
    const t = i18n[currentLang];
    const years = retire - age;
    
    // Inflation 6%
    const infExp = exp * Math.pow(1.06, years);
    const corpus = infExp * 12 * 30; // 30x rule for Indian context
    
    // Future value of portfolio at 10%
    const portGrowth = port * Math.pow(1.10, years);
    let shortfall = corpus - portGrowth;
    if (shortfall < 0) shortfall = 0;
    
    // Required SIP at 12% to cover shortfall
    // FV = P * [ ((1+r)^n - 1) / r ] * (1+r) , where r = 12%/12 = 0.01, n = years*12
    const months = years * 12;
    const r = 0.01;
    let reqSip = 0;
    const compoundFactor = (Math.pow(1 + r, months) - 1) / r * (1 + r);
    if (compoundFactor > 0) reqSip = shortfall / compoundFactor;

    document.getElementById('fireVerdict').innerHTML = t.fire_verd
        .replace('{retire}', retire).replace('{years}', years)
        .replace('{exp}', exp.toLocaleString())
        .replace('{infExp}', Math.round(infExp).toLocaleString())
        .replace('{corpus}', Math.round(corpus).toLocaleString())
        .replace('{port}', port.toLocaleString());

    let adv = [];
    if (sip < reqSip && reqSip > 0) {
        adv.push(t.fire_adv_short.replace('{sip}', sip.toLocaleString()).replace('{years}', years)
                .replace('{corpus}', Math.round(corpus).toLocaleString())
                .replace('{reqSip}', Math.round(reqSip).toLocaleString()));
    } else {
        adv.push(t.fire_adv_good.replace('{sip}', sip.toLocaleString()).replace('{years}', years)
                .replace('{corpus}', Math.round(corpus).toLocaleString()));
    }

    const safeAmt = exp * 12 * 3;
    adv.push(t.fire_adv_safe.replace('{safe}', Math.round(safeAmt).toLocaleString()));
    adv.push(t.fire_adv_ins);
    
    document.getElementById('fireAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}

function generateLifeVerdict({ event, amt }) {
    const t = i18n[currentLang];
    let adv = [];
    
    if (event === 'bonus') {
        const fun = Math.round(amt * 0.10);
        const tax = Math.round(amt * 0.30);
        const inv = amt - fun - tax;
        adv.push(t.life_verd_bonus.replace('{fun}', fun.toLocaleString()).replace('{tax}', tax.toLocaleString()).replace('{inv}', inv.toLocaleString()));
    } 
    else if (event === 'inherit') {
        adv.push(t.life_verd_inherit.replace('{amt}', amt.toLocaleString()));
    }
    else if (event === 'marriage') {
        adv.push(t.life_verd_marriage);
    }
    else if (event === 'baby') {
        adv.push(t.life_verd_baby);
    }

    document.getElementById('lifeAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}

function generateRentVerdict({ cost, dp, roi, tenure, rent, propApp, mfRet }) {
    const t = i18n[currentLang];
    
    // Scenario 1: Buying
    // Loan Amount = Cost - DP
    const p = cost - dp;
    const r = (roi / 12) / 100;
    const n = tenure * 12;
    let emi = 0;
    if (r > 0 && n > 0 && p > 0) {
        emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    }
    
    // Property Future Value
    const buyNw = cost * Math.pow(1 + (propApp / 100), tenure);

    // Scenario 2: Renting & Investing
    // Initial investment = DP
    let rentNw = dp;
    let currentMonthlyRent = rent;
    const mfMonthlyRate = (mfRet / 12) / 100;

    for (let month = 1; month <= n; month++) {
        // Grow the portfolio for the month
        rentNw = rentNw * (1 + mfMonthlyRate);
        
        // Add monthly difference
        let diff = emi - currentMonthlyRent;
        // If rent > emi, difference is negative, meaning we have to dip into portfolio
        rentNw += diff;

        // Increase rent by 5% annually
        if (month % 12 === 0) {
            currentMonthlyRent *= 1.05;
        }
    }

    // Final checks
    let verd = "";
    if (buyNw > rentNw) {
        verd = t.rent_verd_buy.replace('{years}', tenure).replace('{buyNw}', Math.round(buyNw).toLocaleString()).replace('{rentNw}', Math.round(rentNw).toLocaleString());
    } else {
        verd = t.rent_verd_rent.replace('{years}', tenure).replace('{rentNw}', Math.round(rentNw).toLocaleString()).replace('{buyNw}', Math.round(buyNw).toLocaleString());
    }

    document.getElementById('rentVerdict').innerHTML = verd;

    let adv = [];
    adv.push(t.rent_adv_emi.replace('{emi}', Math.round(emi).toLocaleString()).replace('{rent}', rent.toLocaleString()).replace('{diff}', Math.round(Math.max(0, emi - rent)).toLocaleString()));
    adv.push(t.rent_adv_tax);
    adv.push(t.rent_adv_flex);

    document.getElementById('rentAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}

function generateDebtVerdict(data) {
    const t = i18n[currentLang];
    
    // Simulate payoff path given parameters
    function simulateDebt(loans, extraPayment, method = 'avalanche') {
        let simLoans = JSON.parse(JSON.stringify(loans)); 
        let totalMonths = 0;
        let totalInterest = 0;
        let safety = 0;

        while(simLoans.some(l => l.bal > 0) && safety < 1200) {
            totalMonths++;
            safety++;
            
            // Accrue interest for the month
            simLoans.forEach(l => {
                if (l.bal > 0) {
                    let interest = l.bal * (l.roi / 12) / 100;
                    totalInterest += interest;
                    l.bal += interest;
                }
            });

            let activeLoans = simLoans.filter(l => l.bal > 0);
            if (activeLoans.length === 0) break;

            if (method === 'avalanche') {
                activeLoans.sort((a,b) => b.roi - a.roi); // Highest interest first
            }

            let availableExtra = extraPayment;
            
            // Apply minimum EMIs
            activeLoans.forEach(l => {
                let payment = Math.min(l.emi, l.bal);
                l.bal -= payment;
                if (l.emi > payment && method === 'avalanche') {
                    availableExtra += (l.emi - payment);
                }
            });

            // Apply extra money to the target loan
            if (availableExtra > 0 && method === 'avalanche') {
                let unpaidLoans = activeLoans.filter(l => l.bal > 0);
                if (unpaidLoans.length > 0) {
                    let targetLoan = unpaidLoans[0];
                    let extraChunk = Math.min(availableExtra, targetLoan.bal);
                    targetLoan.bal -= extraChunk;
                    availableExtra -= extraChunk;
                    
                    if (availableExtra > 0 && unpaidLoans.length > 1) {
                        unpaidLoans[1].bal -= Math.min(availableExtra, unpaidLoans[1].bal);
                    }
                }
            }
            
            for(let l of simLoans) {
                if(l.bal < 0.01) l.bal = 0;
            }
        }
        return { months: totalMonths, interest: totalInterest };
    }

    const loansBase = [];
    if (data.l1_bal > 0) loansBase.push({ id: 1, bal: data.l1_bal, roi: data.l1_roi, emi: data.l1_emi });
    if (data.l2_bal > 0) loansBase.push({ id: 2, bal: data.l2_bal, roi: data.l2_roi, emi: data.l2_emi });

    const normal = simulateDebt(loansBase, 0, 'normal');
    const fast = simulateDebt(loansBase, data.extra, 'avalanche');

    let diffMonths = Math.max(0, normal.months - fast.months);
    let diffInt = Math.max(0, normal.interest - fast.interest);

    document.getElementById('debtVerdictTime').innerHTML = t.debt_verd_time_saved
        .replace('{extra}', data.extra.toLocaleString())
        .replace('{newMonths}', fast.months)
        .replace('{oldMonths}', normal.months)
        .replace('{diffMonths}', diffMonths);

    document.getElementById('debtVerdictInt').innerHTML = t.debt_verd_int_saved
        .replace('{oldInt}', Math.round(normal.interest).toLocaleString())
        .replace('{newInt}', Math.round(fast.interest).toLocaleString())
        .replace('{diffInt}', Math.round(diffInt).toLocaleString());

    // Update new KPI Boxes
    document.getElementById('debtUiMonths').innerText = diffMonths + "M";
    document.getElementById('debtUiInt').innerText = "₹" + Math.round(diffInt).toLocaleString();

    let adv = [t.debt_adv_avalanche];
    if (data.l1_roi >= 12 || data.l2_roi >= 12) {
        adv.push(t.debt_adv_warning);
    }
    document.getElementById('debtAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}

function generateGoldVerdict(data) {
    const t = i18n[currentLang];
    
    const totalGold = data.phys + data.sgb;
    let allocMsg = "";
    if (data.port > 0 && totalGold > 0) {
        const pct = ((totalGold / data.port) * 100).toFixed(1);
        if (pct <= 15) {
            allocMsg = t.gold_verd_alloc_good.replace('{pct}', pct);
        } else {
            allocMsg = t.gold_verd_alloc_bad.replace('{pct}', pct);
        }
    }

    // Physical gold loss calculation (over 8 years for SGB maturity)
    let lossMsg = "";
    if (data.phys > 0) {
        const missedInterest = data.phys * 0.20; // 2.5% simple int * 8 years
        const makingCharges = data.phys * 0.10;  // 10% making charges loss
        const totalHiddenLoss = missedInterest + makingCharges;
        lossMsg = t.gold_verd_loss.replace('{amount}', data.phys.toLocaleString()).replace('{loss}', totalHiddenLoss.toLocaleString());
    }

    let sgbMsg = "";
    if (data.sgb > 0) {
        const potentialInterest = data.sgb * 0.20;
        sgbMsg = t.gold_verd_sgb.replace('{interest}', potentialInterest.toLocaleString());
    }

    document.getElementById('goldVerdictAlloc').innerHTML = allocMsg;
    document.getElementById('goldVerdictLoss').innerHTML = lossMsg;
    document.getElementById('goldVerdictSgb').innerHTML = sgbMsg;

    // Build advice list
    let adv = [];
    adv.push(t.gold_adv_sgb);
    adv.push(t.gold_adv_limit);

    document.getElementById('goldAdviceList').innerHTML = adv.map(a => `<li style="margin-bottom:12px; line-height:1.6;">${a}</li>`).join('');
}
