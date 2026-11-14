window.DB = {
  materials: {
    box_material_pack_4_rsd: 700,
    box_material_per_box_rsd: 175, // 700 RSD za 4 kutije
    two_color_surcharge_rsd: 0,    // Doplata za 2 boje (0 ako je uključeno u cenu)
    decor_2d_sides_rsd: 250,       // Cena za 2D ukrase / fotografije na stranicama
    butterfly_aliexpress_rsd: 90,
    popup_cube_materials_rsd: 35,
    punch_cake_base_per_tier: 650
  },
  sweets_database: {
    kinder_cokoladica: { name: 'Kinder čokolada', price_per_kg: 2100, weight_g: 12.5 },
    kinder_bueno: { name: 'Kinder Bueno', price_per_kg: 2400, weight_g: 20 },
    ferrero: { name: 'Ferrero Rocher', price_per_kg: 3200, weight_g: 12.5 },
    raffaello: { name: 'Raffaello', price_per_kg: 2800, weight_g: 10 },
    giotto: { name: 'Giotto', price_per_kg: 3000, weight_g: 15 },
    // Ostali slatkiši za Punch tortu:
    lindor: { name: 'Lindt Lindor', price_per_kg: 3900, weight_g: 12.5 },
    mozart: { name: 'Mozart kugle', price_per_kg: 2900, weight_g: 15 },
    lizalica: { name: 'Chupa Chups lizalica', price_per_kg: 1800, weight_g: 12 },
    bananica: { name: 'Krem bananica', price_per_kg: 1100, weight_g: 20 },
    sokic: { name: 'Sokić tetrapak (200ml)', price_per_unit: 45 },
    euroblokic: { name: 'Euroblokić', price_per_kg: 1300, weight_g: 15 },
    najlepse_zeljice: { name: 'Najlepše željice (mini)', price_per_kg: 1900, weight_g: 15 }
  },
  cosmetics_database: {
    sapun: { name: 'Prirodni sapun', price_rsd: 350 },
    stik: { name: 'Prirodni dezodorans stik', price_rsd: 550 },
    labelo: { name: 'Prirodno labelo', price_rsd: 250 }
  },
  labor: {
    hourly_rate_rsd: 600,
    bum_box_assembly_hours: {
      '11x8x10': 1.5,
      '15x15x12': 2.0,
      'custom': 2.2
    },
    punch_cake_labor_per_tier: 700,
    safety_buffer_percent: 15
  }
};
