/* ============================================================
   BUM KUTIJA - Logika konfiguratora (js/bum-box.js)
   ============================================================ */

window.bumBox = {
  currentPackage: 'empty',
  selectedStyle: 'Zvezda',
  sideTheme: 'sweets', // 'sweets' ili 'coffee'

  giftDimensions: {
    Kompaktna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~7 × 7 × 7 cm<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se do 4 čokoladice.</small>',
    Standardna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~12 × 12 × 12 cm<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se do 4 čokoladice.</small>',
    Velika: '📏 <strong>Dimenzije mesta za poklon:</strong> ~15 × 15 × 15 cm<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se do 4 čokoladice.</small>',
    CUSTOM: '✨ <strong>Mesto za poklon:</strong> Izrađuje se po meri vašeg poklona (za 3 cm manje od dimenzija kutije).'
  },

    init() {
    this.hideElements();
    this.bindEvents();
    this.updateSizeOptions();
  },

  hideElements() {
    // Skriva cenu i dugme za poručivanje na WhatsApp
    const priceBox = document.querySelector('.price-box');
    if (priceBox) priceBox.style.display = 'none';

     },


  bindEvents() {
    // Izbor paketa (tabovi)
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPackage(e.target.dataset.pkg));
    });

    // Promena veličine
    document.getElementById('bumSizeSelect')?.addEventListener('change', () => {
      this.updateGiftInfo();
    });
  },

  selectStyle(name, element) {
    this.selectedStyle = name;
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
  },

  switchSideTheme(theme) {
    this.sideTheme = theme;
    document.getElementById('themeOptSweets')?.classList.toggle('selected', theme === 'sweets');
    document.getElementById('themeOptCoffee')?.classList.toggle('selected', theme === 'coffee');

    const sweetsGroup = document.getElementById('bumSweetsGroup');
    const coffeeGroup = document.getElementById('bumCoffeeGroup');

    if (sweetsGroup) sweetsGroup.style.display = (theme === 'sweets') ? 'block' : 'none';
    if (coffeeGroup) coffeeGroup.style.display = (theme === 'coffee') ? 'block' : 'none';
  },

  switchPackage(pkg) {
    this.currentPackage = pkg;
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pkg === pkg);
    });

    const isCustom = (pkg === 'custom_gift');
    const showSides = (pkg === 'sweets_gift' || pkg === 'only_sweets');

    const notes = document.getElementById('customNotesGroup');
    const themeGroup = document.getElementById('sideThemeGroup');

    if (notes) notes.style.display = isCustom ? 'block' : 'none';
    if (themeGroup) themeGroup.style.display = showSides ? 'block' : 'none';

    if (showSides) {
      this.switchSideTheme(this.sideTheme);
    } else {
      const sweetsGroup = document.getElementById('bumSweetsGroup');
      const coffeeGroup = document.getElementById('bumCoffeeGroup');
      if (sweetsGroup) sweetsGroup.style.display = 'none';
      if (coffeeGroup) coffeeGroup.style.display = 'none';
    }
         this.updateSizeOptions();
    this.hideElements();
  },

  },

  updateSizeOptions() {
    const select = document.getElementById('bumSizeSelect');
    if (!select) return;
    select.innerHTML = '';

    if (this.currentPackage === 'custom_gift') {
      select.innerHTML = '<option value="CUSTOM">Prilagođava se vašem poklonu (do 20 × 20 × 20 cm)</option>';
    }     } else if (this.currentPackage === 'only_sweets') {
      select.innerHTML = '<option value="Standardna">15 × 15 × 15 cm (mesto unutra 12 × 12 × 12 cm)</option><option value="Velika">18 × 18 × 18 cm (mesto unutra 15 × 15 × 15 cm)</option>';
    }
else {
      select.innerHTML = '<option value="Kompaktna">10 × 10 × 10 cm</option><option value="Standardna" selected>15 × 15 × 15 cm</option><option value="Velika">18 × 18 × 18 cm</option>';
    }
    this.updateGiftInfo();
  },

  updateGiftInfo() {
    const size = document.getElementById('bumSizeSelect')?.value;
    const box = document.getElementById('bumGiftDimInfo');
    if (box && size) box.innerHTML = this.giftDimensions[size] || '';
  },

  sendWhatsApp() {
    const phone = "381644667485";
    const size = document.getElementById('bumSizeSelect')?.value || 'Standardna';
    const color = document.getElementById('bumColorInput')?.value || 'Po dogovoru';
    const mechSelect = document.getElementById('bumMechanismSelect');
    const mech = mechSelect ? mechSelect.options[mechSelect.selectedIndex].text : 'Kocke';
    const notes = document.getElementById('bumNotes')?.value.trim();

    const interiorSelect = document.getElementById('bumInteriorSelect');
    const interiorText = interiorSelect ? interiorSelect.options[interiorSelect.selectedIndex].text : 'Standardni / bez dodataka';

    // Prikupljanje izbora slatkiša ili kapsula kafe
    let fillItems = [];
    if (this.sideTheme === 'sweets') {
      document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => {
        fillItems.push(el.parentNode.textContent.trim());
      });
    } else {
      document.querySelectorAll('#bumCoffeeGroup input:checked').forEach(el => {
        fillItems.push(el.parentNode.textContent.trim());
      });
    }

    let text = 'Pozdrav! Šaljem upit za BUM KUTIJU 🎁\n\n' +
               '*Paket:* ' + this.currentPackage + '\n' +
               '*Veličina:* ' + size + '\n' +
               '*Stil stranica:* ' + this.selectedStyle + '\n';

    if (this.currentPackage === 'sweets_gift' || this.currentPackage === 'only_sweets') {
      text += '*Tema stranica:* ' + (this.sideTheme === 'coffee' ? 'Kafa kapsule' : 'Slatkiši') + '\n';
      if (fillItems.length > 0) {
        text += '*Izabrano punjenje:* ' + fillItems.join(', ') + '\n';
      }
    }

    text += '*Enterijer:* ' + interiorText + '\n' + 
            '*Boja kutije:* ' + color + '\n' +
            '*Mehanizam:* ' + mech;

    if (notes) {
      text += '\n*Opis poklona i posveta:* ' + notes;
    }

    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => { 
  if (window.bumBox?.init) window.bumBox.init(); 
});
