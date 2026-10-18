/**
 * js/bum-box.js
 * Glavna logika za BUM KUTIJA konfigurator
 */

window.bumBox = {
  currentPkg: 'empty',
  selectedStyle: 'Zvezda',
  sideTheme: 'sweets',

  init: function () {
    this.initTabs();
    this.populateSizes();
    this.bindEvents();
    this.updatePrice();
  },

  // Inicijalizacija tabova na vrhu
  initTabs: function () {
    const tabs = document.querySelectorAll('#bumTabs .tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const pkg = tab.getAttribute('data-pkg');
        this.selectPackage(pkg);
      });
    });
  },

  // Prikaz / skrivanje opcija prema odabranom paketu
  selectPackage: function (pkg) {
    this.currentPkg = pkg;

    const sideThemeGroup = document.getElementById('sideThemeGroup');
    const sweetsGroup = document.getElementById('bumSweetsGroup');
    const coffeeGroup = document.getElementById('bumCoffeeGroup');
    const notesGroup = document.getElementById('customNotesGroup');

    if (pkg === 'empty') {
      if (sideThemeGroup) sideThemeGroup.style.display = 'none';
      if (sweetsGroup) sweetsGroup.style.display = 'none';
      if (coffeeGroup) coffeeGroup.style.display = 'none';
      if (notesGroup) notesGroup.style.display = 'none';
    } else if (pkg === 'sweets_gift' || pkg === 'only_sweets') {
      if (sideThemeGroup) sideThemeGroup.style.display = 'block';
      this.switchSideTheme(this.sideTheme);
      if (notesGroup) notesGroup.style.display = 'none';
    } else if (pkg === 'custom_gift') {
      if (sideThemeGroup) sideThemeGroup.style.display = 'block';
      this.switchSideTheme(this.sideTheme);
      if (notesGroup) notesGroup.style.display = 'block';
    }

    this.populateSizes();
    this.updatePrice();
  },

  // Popunjavanje padajućeg izbornika za veličine kutija
  populateSizes: function () {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (!sizeSelect) return;

    // Ako postoje podaci u bazi (database.js), vuče ih odatle, inače koristi standardne
    const sizes = (window.DB && window.DB.bumSizes) || [
      { id: '15x15x15', label: '15 × 15 × 15 cm (Standardna)', giftDim: '10 × 10 × 12 cm' },
      { id: '18x18x18', label: '18 × 18 × 18 cm (Srednja)', giftDim: '12 × 12 × 14 cm' },
      { id: '20x20x20', label: '20 × 20 × 20 cm (Velika)', giftDim: '14 × 14 × 16 cm' }
    ];

    const currentVal = sizeSelect.value || sizes[0].id;
    sizeSelect.innerHTML = '';

    sizes.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.label;
      if (s.id === currentVal) opt.selected = true;
      sizeSelect.appendChild(opt);
    });

    this.updateSizeInfo(sizeSelect.value);
  },

  // Ažuriranje teksta u gift-info-box
  updateSizeInfo: function (val) {
    const dimInfo = document.getElementById('bumGiftDimInfo');
    if (!dimInfo) return;

    let giftDim = '10 × 10 × 12 cm';
    if (val === '18x18x18') giftDim = '12 × 12 × 14 cm';
    if (val === '20x20x20') giftDim = '14 × 14 × 16 cm';

    dimInfo.innerHTML = `📦 Unutrašnji prostor za poklon (centralni čep): <strong>${giftDim}</strong>`;
    this.updatePrice();
  },

  // Odabir kartice stila bočnih ivica
  selectStyle: function (styleName, el) {
    this.selectedStyle = styleName;
    document.querySelectorAll('.style-option').forEach((opt) => {
      opt.classList.remove('selected');
    });
    if (el) {
      el.classList.add('selected');
    }
  },

  // Prebacivanje između slatkiša i kave
  switchSideTheme: function (theme) {
    this.sideTheme = theme;
    const sweets = document.getElementById('bumSweetsGroup');
    const coffee = document.getElementById('bumCoffeeGroup');

    if (theme === 'coffee') {
      if (sweets) sweets.style.display = 'none';
      if (coffee) coffee.style.display = 'block';
    } else {
      if (sweets) sweets.style.display = 'block';
      if (coffee) coffee.style.display = 'none';
    }
    this.updatePrice();
  },

  // Event listeneri na formi
  bindEvents: function () {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        this.updateSizeInfo(e.target.value);
      });
    }

    // Osluškivanje promjena za cijenu
    document.querySelectorAll('#bumForm input, #bumForm select').forEach((el) => {
      el.addEventListener('change', () => this.updatePrice());
    });
  },

  // Kalkulacija cijene
  updatePrice: function () {
    const priceDisplay = document.getElementById('bumPriceDisplay');
    if (!priceDisplay) return;

    if (window.pricingEngine && window.pricingEngine.calcBumBox) {
      const calculated = window.pricingEngine.calcBumBox(this.collectFormData());
      priceDisplay.textContent = calculated.toLocaleString('sr-RS') + ' RSD';
      return;
    }

    // Osnovni proračun ako pricing-engine nije učitan
    let total = 2800;
    const size = document.getElementById('bumSizeSelect') ? document.getElementById('bumSizeSelect').value : '15x15x15';
    if (size === '18x18x18') total += 600;
    if (size === '20x20x20') total += 1200;

    if (this.currentPkg === 'sweets_gift') total += 1200;
    if (this.currentPkg === 'only_sweets') total += 1500;
    if (this.currentPkg === 'custom_gift') total += 2000;

    priceDisplay.textContent = total.toLocaleString('sr-RS') + ' RSD';
  },

  // Prikupljanje unesenih podataka
  collectFormData: function () {
    const colorInput = document.getElementById('bumColorInput');
    const interiorSelect = document.getElementById('bumInteriorSelect');
    const mechanismSelect = document.getElementById('bumMechanismSelect');
    const notes = document.getElementById('bumNotes');

    const fillings = [];
    if (this.currentPkg !== 'empty') {
      const selector = this.sideTheme === 'coffee' 
        ? '#bumCoffeeGroup input[type="checkbox"]:checked' 
        : '#bumSweetsGroup input[type="checkbox"]:checked';
      
      document.querySelectorAll(selector).forEach((chk) => {
        fillings.push(chk.parentElement.textContent.trim());
      });
    }

    return {
      package: this.currentPkg,
      size: document.getElementById('bumSizeSelect') ? document.getElementById('bumSizeSelect').value : '15x15x15',
      color: colorInput ? colorInput.value : '',
      interior: interiorSelect ? interiorSelect.value : 'Standardni',
      style: this.selectedStyle,
      mechanism: mechanismSelect ? mechanismSelect.value : 'cubes',
      fillings: fillings,
      notes: notes ? notes.value : ''
    };
  },

  // Slanje porudžbine na WhatsApp
  sendWhatsApp: function () {
    const data = this.collectFormData();
    const pkgLabels = {
      empty: '1. Prazna BUM kutija',
      sweets_gift: '2. BUM kutija sa slatkim/kafa stranama',
      only_sweets: '3. BUM kutija punjena slatkišima ili kafom',
      custom_gift: '4. Personalizovani BUM poklon'
    };

    let msg = `Pozdrav! Želim poručiti BUM kutiju:\n\n`;
    msg += `📦 Paket: ${pkgLabels[data.package] || data.package}\n`;
    msg += `📏 Veličina: ${data.size}\n`;
    msg += `🎨 Boja: ${data.color || 'Standardna'}\n`;
    msg += `✨ Dekoracija: ${data.interior}\n`;
    msg += `📐 Stil ivica: ${data.style}\n`;
    msg += `⚙️ Mehanizam: ${data.mechanism}\n`;

    if (data.fillings.length > 0) {
      msg += `🍬 Punjenje: ${data.fillings.join(', ')}\n`;
    }
    if (data.notes) {
      msg += `📝 Napomena: ${data.notes}\n`;
    }

    const price = document.getElementById('bumPriceDisplay');
    if (price) {
      msg += `\n💰 Cena: ${price.textContent}`;
    }

    const phone = '381600000000'; // Ovdje ide tvoj WhatsApp broj
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
};

// Automatsko pokretanje kada se DOM učita
document.addEventListener('DOMContentLoaded', function () {
  window.bumBox.init();
});
