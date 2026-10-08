import { DB } from './database.js';

export const PricingEngine = {
  getSweetUnitCost(sweetKey) {
    const sweet = DB.sweets_database[sweetKey];
    if (!sweet) return 60;
    if (sweet.price_per_unit) return sweet.price_per_unit;
    return Math.round((sweet.price_per_kg / 1000) * sweet.weight_g);
  },

  calculate3DPrintCost(itemId) {
    const item = DB.printing_3d.catalog[itemId];
    if (!item) return 0;
    const filamentCost = (item.weight_g / 1000) * DB.printing_3d.filament_per_kg_rsd;
    const machineCost = item.print_time_hours * DB.printing_3d.electricity_and_wear_per_hour;
    return Math.round(filamentCost + machineCost + item.base_markup_rsd);
  },

  calculateBumBox({ packageType, size, mechanism, chosenSweets, selected3DItem }) {
    let sheets = size === 'Kompaktna' ? 1.5 : (size === 'Standardna' ? 2 : 2.5);
    let materialCost = (sheets * DB.materials.paper_b1_sheet_rsd) +
                       (DB.materials.ribbon_meters_per_box * DB.materials.ribbon_per_meter_rsd) +
                       DB.materials.glue_dots_and_consumables_rsd;

    if (mechanism === 'cubes') {
      materialCost += (6 * DB.materials.popup_cube_materials_rsd);
    } else if (mechanism === 'butterflies') {
      materialCost += (6 * DB.materials.butterfly_aliexpress_rsd);
    } else if (mechanism === 'combo') {
      materialCost += (4 * DB.materials.popup_cube_materials_rsd) + (4 * DB.materials.butterfly_aliexpress_rsd);
    }

    let sweetsCost = 0;
    if (packageType === 'sweets_gift' || packageType === 'only_sweets') {
      const sweetCount = (size === 'Kompaktna') ? 4 : 16;
      let avgSweet = 100;
      if (chosenSweets.length > 0) {
        avgSweet = chosenSweets.reduce((sum, key) => sum + this.getSweetUnitCost(key), 0) / chosenSweets.length;
      }
      sweetsCost = sweetCount * avgSweet;
      if (packageType === 'only_sweets') {
        sweetsCost += (size === 'Standardna' ? 850 : 1350);
      }
    }

    let printCost = 0;
    if (packageType === 'custom_gift' && selected3DItem) {
      printCost = this.calculate3DPrintCost(selected3DItem);
    }

    const hours = DB.labor.bum_box_assembly_hours[size] || 2.5;
    const laborCost = hours * DB.labor.hourly_rate_rsd;

    let subtotal = materialCost + sweetsCost + printCost + laborCost;
    let total = subtotal * (1 + (DB.labor.safety_buffer_percent / 100));
    return Math.round(total / 50) * 50;
  },

  calculatePunchCake({ holes, tiers, sweetsPerHole, selectedSweets, withToys }) {
    const structureCost = tiers * DB.materials.punch_cake_base_per_tier + 500;
    let avgSweetCost = 55;
    if (selectedSweets.length > 0) {
      const sum = selectedSweets.reduce((acc, k) => acc + this.getSweetUnitCost(k), 0);
      avgSweetCost = sum / selectedSweets.length;
    }
    const sweetsTotal = holes * sweetsPerHole * avgSweetCost;
    const toysTotal = withToys ? (holes * 70) : 0;
    const labor = tiers * DB.labor.punch_cake_labor_per_tier;

    let subtotal = structureCost + sweetsTotal + toysTotal + labor;
    let total = subtotal * (1 + (DB.labor.safety_buffer_percent / 100));
    return Math.round(total / 50) * 50;
  }
};
