window.PricingEngine = {
  getSweetUnitCost(sweetKey) {
    const sweet = window.DB.sweets_database[sweetKey];
    if (!sweet) return 50;
    if (sweet.price_per_unit) return sweet.price_per_unit;
    return Math.round((sweet.price_per_kg / 1000) * sweet.weight_g);
  },

  calculateBumBox({
    size,
    sidesType,
    sideSweet,
    underCapType,
    underCapSweet
  }) {
    // 1. Osnovna cena kutije bez punjenja strana i čepa = 2000 RSD
    let total = window.DB.materials.base_empty_bum_box_price_rsd;

    // 2. Punjenje stranica
    if (sidesType === 'sweets' && sideSweet) {
      const sweetCount = (size === '11x8x10') ? 8 : 16;
      total += sweetCount * this.getSweetUnitCost(sideSweet);
    } else if (sidesType === 'decor_2d') {
      total += window.DB.materials.decor_2d_sides_rsd;
    }

    // 3. Punjenje ispod čepa
    if (underCapType === 'sweets' && underCapSweet) {
      const capSweetCount = (size === '11x8x10') ? 10 : 18;
      total += capSweetCount * this.getSweetUnitCost(underCapSweet);
    } else if (underCapType === 'cosmetics') {
      total += window.DB.cosmetics_combo.price_rsd; // 1900 RSD kombo
    }

    return Math.round(total / 50) * 50;
  },

  calculatePunchCake({ holes, tiers, sweetsPerHole, selectedSweets, withToys }) {
    const structure = tiers * window.DB.materials.punch_cake_base_per_tier + 500;
    let avgSweet = 55;
    if (selectedSweets.length > 0) {
      avgSweet = selectedSweets.reduce((s, k) => s + this.getSweetUnitCost(k), 0) / selectedSweets.length;
    }
    const sweetsTotal = holes * sweetsPerHole * avgSweet;
    const toysTotal = withToys ? (holes * 70) : 0;
    const labor = tiers * window.DB.labor.punch_cake_labor_per_tier;
    let total = (structure + sweetsTotal + toysTotal + labor) * (1 + (window.DB.labor.safety_buffer_percent / 100));
    return Math.round(total / 50) * 50;
  }
};
