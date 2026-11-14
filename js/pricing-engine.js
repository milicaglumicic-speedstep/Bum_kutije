window.PricingEngine = {
  getSweetUnitCost(sweetKey) {
    const sweet = window.DB.sweets_database[sweetKey];
    if (!sweet) return 50;
    if (sweet.price_per_unit) return sweet.price_per_unit;
    return Math.round((sweet.price_per_kg / 1000) * sweet.weight_g);
  },

  calculateBumBox({
    size,
    colorCount,
    mechanism,
    sidesType,
    sidesSweets,
    underCapType,
    underCapSweets,
    underCapCosmetics
  }) {
    // 1. Cena materijala kutije: 700 RSD za 4 kutije = 175 RSD po kutiji
    let materialCost = window.DB.materials.box_material_per_box_rsd;
    if (colorCount === 2) {
      materialCost += window.DB.materials.two_color_surcharge_rsd;
    }

    // 2. Mehanizam (Pop-up kocke, Leptirovi, Combo)
    if (mechanism === 'cubes') {
      materialCost += 6 * window.DB.materials.popup_cube_materials_rsd;
    } else if (mechanism === 'butterflies') {
      materialCost += 6 * window.DB.materials.butterfly_aliexpress_rsd;
    } else if (mechanism === 'combo') {
      materialCost += (4 * window.DB.materials.popup_cube_materials_rsd) + (4 * window.DB.materials.butterfly_aliexpress_rsd);
    }

    // 3. Punjenje stranica (Slatkiši ili 2D ukrasi)
    let sidesCost = 0;
    if (sidesType === 'sweets') {
      const sweetCount = (size === '11x8x10') ? 8 : 16; // 2 po stranici za manju, 4 po stranici za veću/custom
      let avgSweet = 45;
      if (sidesSweets && sidesSweets.length > 0) {
        avgSweet = sidesSweets.reduce((sum, key) => sum + this.getSweetUnitCost(key), 0) / sidesSweets.length;
      }
      sidesCost = sweetCount * avgSweet;
    } else if (sidesType === 'decor_2d') {
      sidesCost = window.DB.materials.decor_2d_sides_rsd;
    }

    // 4. Punjenje ispod čepa
    let underCapCost = 0;
    if (underCapType === 'sweets') {
      const capSweetCount = (size === '11x8x10') ? 10 : 18;
      let avgCapSweet = 45;
      if (underCapSweets && underCapSweets.length > 0) {
        avgCapSweet = underCapSweets.reduce((sum, key) => sum + this.getSweetUnitCost(key), 0) / underCapSweets.length;
      }
      underCapCost = capSweetCount * avgCapSweet;
    } else if (underCapType === 'cosmetics') {
      if (underCapCosmetics && underCapCosmetics.length > 0) {
        underCapCost = underCapCosmetics.reduce((sum, key) => {
          return sum + (window.DB.cosmetics_database[key]?.price_rsd || 0);
        }, 0);
      }
    } else if (underCapType === 'custom_gift') {
      // Korisnik stavlja svoj poklon ili se dogovara naknadno
      underCapCost = 0;
    }

    // 5. Rad + sigurnosni bafer
    const hours = window.DB.labor.bum_box_assembly_hours[size] || 1.8;
    const labor = hours * window.DB.labor.hourly_rate_rsd;

    let total = (materialCost + sidesCost + underCapCost + labor) * (1 + (window.DB.labor.safety_buffer_percent / 100));
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
