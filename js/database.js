window.DB = {
  materials: {
    paper_b1_sheet_rsd: 120, ribbon_per_meter_rsd: 45, ribbon_meters_per_box: 2.2,
    butterfly_aliexpress_rsd: 90, popup_cube_materials_rsd: 35, glue_dots_and_consumables_rsd: 80, punch_cake_base_per_tier: 650
  },
  sweets_database: {
    ferrero: { name: 'Ferrero Rocher', price_per_kg: 3200, weight_g: 12.5 },
    raffaello: { name: 'Raffaello', price_per_kg: 2800, weight_g: 10 },
    lindor: { name: 'Lindt Lindor', price_per_kg: 3900, weight_g: 12.5 },
    mozart: { name: 'Mozart kugle', price_per_kg: 2900, weight_g: 15 },
    kinder_bueno: { name: 'Kinder Bueno (mini)', price_per_kg: 2400, weight_g: 20 },
    kinder_cokoladica: { name: 'Kinder čokoladica', price_per_kg: 2100, weight_g: 12.5 },
    lizalica: { name: 'Chupa Chups lizalica', price_per_kg: 1800, weight_g: 15 },
    bananica: { name: 'Krem bananica', price_per_kg: 1100, weight_g: 25 },
    sokic: { name: 'Sokić tetrapak (200ml)', price_per_unit: 45 },
    euroblokic: { name: 'Euroblokić', price_per_kg: 1300, weight_g: 15 },
    najlepse_zeljice: { name: 'Najlepše željice (mini)', price_per_kg: 1900, weight_g: 15 }
  },
  mechanism_surcharges: {
    cubes: 200,          // Iskačuće pop-up kocke (+200 RSD)
    butterflies: 200,  // Iskačući leteći leptirovi (+200 RSD)
    combo: 400         // Kombo mehanizam (+500 RSD doplata)
  },
  labor: {
    hourly_rate_rsd: 700,
    bum_box_assembly_hours: { Kompaktna: 1.5, Standardna: 2.2, Velika: 2.8, CUSTOM: 3.2 },
    punch_cake_labor_per_tier: 700, safety_buffer_percent: 15
  }
};
