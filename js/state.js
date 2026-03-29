export let state = {
    currentLang: 'en',
    currentHealthData: null,
    currentTaxData: null,
    currentCoupleData: null,
    currentFireData: null,
    currentLifeData: null,
    currentRentData: null,
    currentDebtData: null,
    currentGoldData: null
};

// Global i18n access since lang.js is loaded as a script
export const getI18n = () => window.i18n;
