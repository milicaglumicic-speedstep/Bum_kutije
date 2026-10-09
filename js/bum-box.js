window.bumBox = {
  currentPackage: 'empty',
  selectedStyle: 'Zvezda',
  giftDimensions: {
    Kompaktna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~6 × 6 cm (visina do 4.5 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se po 1 čokoladica (ukupno 4).</small>',
    Standardna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~9 × 9 cm (visina do 8 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    Velika: '📏 <strong>Dimenzije mesta za poklon:</strong> ~12 × 12 cm (visina do 10 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    CUSTOM: '✨ <strong>Mesto za poklon:</strong> Izrađuje se po meri vašeg poklona (do 20 × 20 × 20 cm).'
  },

  init() {
    this.bindEvents();
    this.updateSizeOptions();
    this.calculatePrice();
  },

  bindEvents() {
    // 1. Listen to the interior dropdown change event
    document.getElementById('bumInteriorSelect')?.addEventListener('change', () => this.calculatePrice());

    // 2. Listen to tab selection clicks
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPackage(e.target.dataset.pkg));
    });

    // 3. Listen to box sizing modifications
    document.getElementById('bumSizeSelect')?.addEventListener('change', () => {
      this.updateGiftInfo();
      this.calculatePrice();
    });

    // 4. Listen to structural mechanism updates (Duplicate entry clean up)
    document.getElementById('bumMechanismSelect')?.addEventListener('change', () => this.calculatePrice());

    // 5. Listen to sidebar candy item checkbox selections
    document.querySelectorAll('#bumSweetsGroup input[type="checkbox"]').forEach(c => {
      c.addEventListener('change', () => this.calculatePrice());
    });
  },

  selectStyle(name, element) {
    this.selectedStyle = name;
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
  },

  switchPackage(pkg) {
    this.currentPackage = pkg;
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pkg === pkg);
    });

    const isCustom = (pkg === 'custom_gift');
    const notes = document.getElementById('customNotesGroup');
    const sweets = document.getElementById('bumSweetsGroup');

    if (notes) notes.style.display = isCustom ? 'block' : 'none';
    if (sweets) sweets.style.display = (pkg === 'sweets_gift' || pkg === 'only_sweets') ? 'block' : 'none';

    this.updateSizeOptions();
    this.calculatePrice();
  },

  updateSizeOptions() {
    const select = document.getElementById('bumSizeSelect');
    if (!select) return;
    select.innerHTML = '';

    if (this.currentPackage === 'custom_gift') {
      select.innerHTML = '<option value="CUSTOM">Prilagođava se vašem poklonu (do 20 × 20 × 20 cm)</option>';
    } else if (this.currentPackage === 'only_sweets') {
      select.innerHTML = '<option value="Standardna">15 × 15 × 15 cm do 150g ispod čepa</option><option value="Velika">18 × 18 × 18 cm do 250g ispod čepa</option>';
    } else {
      select.innerHTML = '<option value="Kompaktna">10 × 10 × 10 cm</option><option value="Standardna" selected>15 × 15 × 15 cm</option><option value="Velika">18 × 18 × 18 cm</option>';
    }
    this.updateGiftInfo();
  },

  updateGiftInfo() {
    const size = document.getElementById('bumSizeSelect')?.value;
    const box = document.getElementById('bumGiftDimInfo');
    if (box && size) box.innerHTML = this.giftDimensions[size] || '';
  },

  calculatePrice() {
    const size = document.getElementById('bumSizeSelect')?.value || 'Standardna';
    const mechanism = document.getElementById('bumMechanismSelect')?.value || 'cubes';
    
    // FIXED: Reads the selected interior value from your new dropdown layout option
    const interior = document.getElementById('bumInteriorSelect')?.value || 'Standardni';

    let chosenSweets = [];
    document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => chosenSweets.push(el.value));

    if (!window.PricingEngine) return;
    const total = window.PricingEngine.calculateBumBox({
      packageType: this.currentPackage,
      size,
      mechanism,
      chosenSweets,
      interior: interior // Passes option layout value to pricing engine calculation if needed
    });

    const disp = document.getElementById('bumPriceDisplay');
    if (disp) disp.innerText = total.toLocaleString('sr-RS') + ' RSD';
  },

  sendWhatsApp() {
    const phone = "381644667485";
    const size = document.getElementById('bumSizeSelect')?.value || 'Standardna';
    const color = document.getElementById('bumColorInput')?.value || 'Po dogovoru';
    const mechSelect = document.getElementById('bumMechanismSelect');
    const mech = mechSelect ? mechSelect.options[mechSelect.selectedIndex].text : 'Kocke';
    const price = document.getElementById('bumPriceDisplay')?.innerText || 'Na upit';
    const notes = document.getElementById('bumNotes')?.value.trim();

    // FIXED: Correctly extracts the text selection from your option dropdown element
    const interiorSelect = document.getElementById('bumInteriorSelect');
    const interiorText = interiorSelect ? interiorSelect.options[interiorSelect.selectedIndex].text : 'Standardni / bez dodataka';

    let text = 'Pozdrav! Šaljem upit za BUM KUTIJU 🎁\n\n' +
               '*Paket:* ' + this.currentPackage + '\n' +
               '*Veličina:* ' + size + '\n' +
               '*Stil stranica:* ' + this.selectedStyle + '\n' +
               '*Enterijer:* ' + interiorText + '\n' + 
               '*Boja kutije:* ' + color + '\n' +
               '*Mehanizam:* ' + mech + '\n' +
               '*Cena:* ' + price;

    if (notes) text += '\n*Opis poklona i posveta:* ' + notes;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => { 
  if (window.bumBox?.init) window.bumBox.init(); 
});
