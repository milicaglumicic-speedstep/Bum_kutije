window.DB = {
  materials: {
    paper_b1_sheet_rsd: 120,
    ribbon_per_meter_rsd: 45,
    ribbon_meters_per_box: 2.2,
    butterfly_aliexpress_rsd: 90,
    popup_cube_materials_rsd: 35,
    glue_dots_and_consumables_rsd: 80,
    punch_cake_base_per_tier: 650
  },
  sweets_database: {
    ferrero: { name: 'Ferrero Rocher', price_per_kg: 3200, weight_g: 12.5 },
    raffaello: { name: 'Raffaello', price_per_kg: 2800, weight_g: 10 },
    lindor: { name: 'Lindt Lindor', price_per_kg: 3900, weight_g: 12.5 },
    mozart: { name: 'Mozart kugle', price_per_kg: 2900, weight_g: 15 },
    kinder_bueno: { name: 'Kinder Bueno (mini)', price_per_kg: 2400, weight_g: 20 },
    kinder_cokoladica: { name: 'Kinder čokoladica', price_per_kg: 2100, weight_g: 12.5 },
    lizalica: { name: 'Chupa Chups lizalica', price_per_kg: 1800, weight_g: 12 },
    bananica: { name: 'Krem bananica', price_per_kg: 1100, weight_g: 20 },
    sokic: { name: 'Sokić tetrapak (200ml)', price_per_unit: 45 },
    euroblokic: { name: 'Euroblokić', price_per_kg: 1300, weight_g: 15 },
    najlepse_zeljice: { name: 'Najlepše željice (mini)', price_per_kg: 1900, weight_g: 15 }
  },
  printing_3d: {
    filament_per_kg_rsd: 2400,
    electricity_and_wear_per_hour: 40,
    available_colors: ['Crna', 'Bela', 'Žuta'],
    catalog: {
      geom_vase: { id: 'geom_vase', name: 'Mini geometrijska vaza / držač', weight_g: 45, print_time_hours: 2.2, base_markup_rsd: 400 },
      lithophane_box: { id: 'lithophane_box', name: 'Litofan foto-kocka (sa LED rasvetom)', weight_g: 65, print_time_hours: 3.5, base_markup_rsd: 650 },
      fidget_infinity: { id: 'fidget_infinity', name: 'Infinity Cube mehanizam', weight_g: 35, print_time_hours: 1.8, base_markup_rsd: 350 },
      custom_keychain: { id: 'custom_keychain', name: 'Personalizovani 3D privezak sa imenom', weight_g: 15, print_time_hours: 0.8, base_markup_rsd: 250 }
    }
  },
  labor: {
    hourly_rate_rsd: 600,
    bum_box_assembly_hours: { Kompaktna: 1.5, Standardna: 2.2, Velika: 2.8, CUSTOM: 3.2 },
    punch_cake_labor_per_tier: 700,
    safety_buffer_percent: 15
  }
};