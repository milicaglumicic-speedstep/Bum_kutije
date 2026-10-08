window.PricingEngine = {
  getSweetUnitCost(sweetKey) {
    const sweet = window.DB.sweets_database[sweetKey];
    if (!sweet) return 60;
    if (sweet.price_per_unit) return sweet.price_per_unit;
    return Math.round((sweet.price_per_kg / 1000) * sweet.weight_g);
  },
  calculate3DPrintCost(itemId) {
    const item = window.DB.printing_3d.catalog[itemId];
    if (!item) return 0;
    const filament = (item.weight_g / 1000) * window.DB.printing_3d.filament_per_kg_rsd;
    const machine = item.print_time_hours * window.DB.printing_3d.electricity_and_wear_per_hour;
    return Math.round(filament + machine + item.base_markup_rsd);
  },
  calculateBumBox({ packageType, size, mechanism, chosenSweets, selected3DItem }) {
    let sheets = size === 'Kompaktna' ? 1.5 : (size === 'Standardna' ? 2 : 2.5);
    let materialCost = (sheets * window.DB.materials.paper_b1_sheet_rsd) +
                       (window.DB.materials.ribbon_meters_per_box * window.DB.materials.ribbon_per_meter_rsd) +
                       window.DB.materials.glue_dots_and_consumables_rsd;
    if (mechanism === 'cubes') materialCost += (6 * window.DB.materials.popup_cube_materials_rsd);
    else if (mechanism === 'butterflies') materialCost += (6 * window.DB.materials.butterfly_aliexpress_rsd);
    else if (mechanism === 'combo') materialCost += (4 * window.DB.materials.popup_cube_materials_rsd) + (4 * window.DB.materials.butterfly_aliexpress_rsd);

    let sweetsCost = 0;
    if (packageType === 'sweets_gift' || packageType === 'only_sweets') {
      const sweetCount = (size === 'Kompaktna') ? 4 : 16;
      let avgSweet = 100;
      if (chosenSweets.length > 0) {
        avgSweet = chosenSweets.reduce((s, k) => s + this.getSweetUnitCost(k), 0) / chosenSweets.length;
      }
      sweetsCost = sweetCount * avgSweet;
      if (packageType === 'only_sweets') sweetsCost += (size === 'Standardna' ? 850 : 1350);
    }
    let printCost = (packageType === 'custom_gift' && selected3DItem) ? this.calculate3DPrintCost(selected3DItem) : 0;
    const labor = (window.DB.labor.bum_box_assembly_hours[size] || 2.5) * window.DB.labor.hourly_rate_rsd;
    let total = (materialCost + sweetsCost + printCost + labor) * (1 + (window.DB.labor.safety_buffer_percent / 100));
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