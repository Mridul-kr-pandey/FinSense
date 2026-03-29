document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input:not([type="file"]), select');
    // Load previously saved values
    inputs.forEach(input => {
        if (input.id) {
            const savedValue = localStorage.getItem('finsense_' + input.id);
            if (savedValue !== null && input.type !== 'file') {
                input.value = savedValue;
            }
            
            // Save on change
            input.addEventListener('input', () => {
                localStorage.setItem('finsense_' + input.id, input.value);
            });
            input.addEventListener('change', () => {
                localStorage.setItem('finsense_' + input.id, input.value);
            });
        }
    });

    // Auto-calculate on load if we have basic loaded forms so the results stay open.
    // Give script.js time to attach event listeners
    setTimeout(() => {
        const formsToTrigger = [
            { form: 'healthForm', req: 'income' },
            { form: 'taxForm', req: 'tax_gross' },
            { form: 'coupleForm', req: 'p1_income' },
            { form: 'fireForm', req: 'fire_exp' },
            { form: 'lifeForm', req: 'life_evt' },
            { form: 'rentForm', req: 'rent_cost' },
            { form: 'debtForm', req: 'd1_bal' },
            { form: 'goldForm', req: 'gold_port' }
        ];

        formsToTrigger.forEach(f => {
            const formEl = document.getElementById(f.form);
            const reqEl = document.getElementById(f.req);
            // If the required element has a value (was loaded from storage), auto-submit
            if (formEl && reqEl && localStorage.getItem('finsense_' + f.req)) {
                // We dispatch submit event, but we need to pass bubbling to hit the bound listeners
                formEl.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
        });
        
        // Load active tab
        const savedTab = localStorage.getItem('finsense_active_tab');
        if (savedTab) {
            const btn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
            if (btn) btn.click();
        }

    }, 300);

    // Save active tab
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.setItem('finsense_active_tab', btn.getAttribute('data-tab'));
        });
    });
});
