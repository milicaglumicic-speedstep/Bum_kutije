window.PricingEngine = {
window.PricingEngine = {
  getSweetUnitCost(sweetKey) {
    const sweet = window.DB.sweets_database[sweetKey];
    if (!sweet) return 60; // Sigurnosni fallback ako slatkiš ne postoji
    return sweet.price_per_unit; // Direktno uzima cenu po komadu
  },


calculateBumBox({ packageType, size, mechanism, chosenSweets }) {
    let sheets = size === 'Kompaktna' ? 1.5 : (size === 'Standardna' ? 2 : 2.5);
    let materialCost = (sheets * window.DB.materials.paper_b1_sheet_rsd) +
                       (window.DB.materials.ribbon_meters_per_box * window.DB.materials.ribbon_per_meter_rsd) +
                       window.DB.materials.glue_dots_and_consumables_rsd;

    // SAFE FIX: If mechanism_surcharges is missing from window.DB, default to 0 or 500 for combo
    let mechSurcharge = 0;
    if (window.DB.mechanism_surcharges) {
      mechSurcharge = window.DB.mechanism_surcharges[mechanism] || 0;
    } else if (mechanism === 'combo') {
      mechSurcharge = 500; // Fallback doplata for combo
    }

    let sweetsCost = 0;
    if (packageType === 'sweets_gift' || packageType === 'only_sweets') {
      const sweetCount = (size === 'Kompaktna') ? 4 : 16;
      let avgSweet = 100;
      if (chosenSweets && chosenSweets.length > 0) {
        avgSweet = chosenSweets.reduce((s, k) => s + this.getSweetUnitCost(k), 0) / chosenSweets.length;
      }
      sweetsCost = sweetCount * avgSweet;
      if (packageType === 'only_sweets') sweetsCost += (size === 'Standardna' ? 850 : 1350);
    }

    const labor = (window.DB.labor.bum_box_assembly_hours[size] || 2.5) * window.DB.labor.hourly_rate_rsd;
    let total = (materialCost + sweetsCost + labor + mechSurcharge) * (1 + (window.DB.labor.safety_buffer_percent / 100));
    return Math.round(total / 50) * 50;
  },

  calculatePunchCake({ holes, tiers, sweetsPerHole, selectedSweets, withToys }) {
    // Osnovna cena strukture (spratovi + fiksni trošak izrade)
    const structure = tiers * window.DB.materials.punch_cake_base_per_tier + 500;
    
    // 1. Sabiramo cenu pojedinačnih slatkiša koji su štiklirani
    let sweetsUnitCostSum = 0;
    if (selectedSweets.length > 0) {
      sweetsUnitCostSum = selectedSweets.reduce((suma, trenutniSlatkis) => {
        return suma + this.getSweetUnitCost(trenutniSlatkis);
      }, 0);
    } else {
      sweetsUnitCostSum = 55; // Default cena ako ništa nije izabrano
    }
    
    // 2. FORMIRANJE CENE: Cena pojedinačnih slatkiša * broj rupa * broj slatkiša po rupi
    const sweetsTotal = sweetsUnitCostSum * holes * sweetsPerHole;
    
    const toysTotal = withToys ? (holes * 70) : 0;
    const labor = tiers * window.DB.labor.punch_cake_labor_per_tier;
    
    // Ukupna cena sa sigurnosnim bufferom iz baze podataka
    let total = (structure + sweetsTotal + toysTotal + labor) * (1 + (window.DB.labor.safety_buffer_percent / 100));
    return Math.round(total / 50) * 50;
  }

};
