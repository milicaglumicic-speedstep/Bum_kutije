/**
 * js/bum-box.js
 * Glavna logika za BUM KUTIJA konfigurator
 */

window.bumBox = {
  currentPkg: 'empty',
  selectedStyle: 'Koverat (u centar)',
  sideTheme: 'sweets',

  init: function () {
    this.initTabs();
    this.populateSizes();
    this.initSideDropdown();
    this.bindEvents();
  },

  // Inicijalizacija tabova na vrhu
  initTabs: function () {
    const tabs = document.querySelectorAll('#bumTabs .tab-btn');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const pkg = tab.getAttribute('data-pkg');
        this.selectPackage(pkg);
      });
    });
  },

  // Prikaz i skrivanje sekcija prema izabranom paketu
  selectPackage: function (pkg) {
    this.currentPkg = pkg;

    const sideThemeGroup = document.getElementById('sideThemeGroup');
    const sweetsGroup = document.getElementById('bumSweetsGroup');
    const coffeeGroup = document.getElementById('bumCoffeeGroup');
    const customSideGroup = document.getElementById('bumCustomSideGroup');
    const notesGroup = document.getElementById('customNotesGroup');

    if (pkg === 'empty') {
      if (sideThemeGroup) sideThemeGroup.style.display = 'none';
      if (sweetsGroup) sweetsGroup.style.display = 'none';
      if (coffeeGroup) coffeeGroup.style.display = 'none';
      if (customSideGroup) customSideGroup.style.display = 'none';
      if (notesGroup) notesGroup.style.display = 'none';
    } else {
      if (sideThemeGroup) sideThemeGroup.style.display = 'block';
      if (notesGroup) notesGroup.style.display = 'block';
      
      const themeSelect = document.getElementById('bumSideThemeSelect');
      this.switchSideTheme(themeSelect ? themeSelect.value : this.sideTheme);
    }

    this.populateSizes();
  },

  // Prikaz polja za unos sopstvenog motiva enterijera
  toggleCustomInterior: function (val) {
    const customInput = document.getElementById('bumCustomInteriorInput');
    if (!customInput) return;

    if (val === 'custom') {
      customInput.style.display = 'block';
      customInput.focus();
    } else {
      customInput.style.display = 'none';
    }
  },

  // Prebacivanje teme stranica
  switchSideTheme: function (theme) {
    this.sideTheme = theme;
    const sweets = document.getElementById('bumSweetsGroup');
    const coffee = document.getElementById('bumCoffeeGroup');
    const customSides = document.getElementById('bumCustomSideGroup');

    if (theme === 'coffee') {
      if (sweets) sweets.style.display = 'none';
      if (coffee) coffee.style.display = 'block';
      if (customSides) customSides.style.display = 'none';
    } else if (theme === 'custom_sides') {
      if (sweets) sweets.style.display = 'none';
      if (coffee) coffee.style.display = 'none';
      if (customSides) {
        customSides.style.display = 'block';
        const inp = document.getElementById('bumCustomSideInput');
        if (inp) inp.focus();
      }
    } else {
      if (sweets) sweets.style.display = 'block';
      if (coffee) coffee.style.display = 'none';
      if (customSides) customSides.style.display = 'none';
    }
  },

  // Popunjavanje izbornika veličina
  populateSizes: function () {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (!sizeSelect) return;

    const sizes = (window.DB && window.DB.bumSizes) || [
      { id: '15x15x15', label: '15 × 15 × 15 cm (Standardna)', giftDim: '10 × 10 × 12 cm' },
      { id: '18x18x18', label: '18 × 18 × 18 cm (Srednja)', giftDim: '12 × 12 × 15 cm' },
      { id: '20x20x20', label: '20 × 20 × 20 cm (Velika)', giftDim: '14 × 14 × 17 cm' }
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

  // Ažuriranje unutrašnjih dimenzija
  updateSizeInfo: function (val) {
    const dimInfo = document.getElementById('bumGiftDimInfo');
    if (!dimInfo) return;

    let giftDim = '10 × 10 × 12 cm';
    if (val === '18x18x18') giftDim = '12 × 12 × 15 cm';
    if (val === '20x20x20') giftDim = '14 × 14 × 17 cm';

    dimInfo.innerHTML = `📦 Unutrašnji prostor za poklon (centralni čep): <strong>${giftDim}</strong>`;
  },

  // Kompletno rukovanje padajućim menijem za stil bočnih ivica
  initSideDropdown: function () {
    const btn = document.getElementById('sideDropdownBtn');
    const list = document.getElementById('sideOptionsList');
    const hiddenInput = document.getElementById('selectedSideStyle');
    const content = document.getElementById('sideSelectedContent');
    const self = this;

    if (!btn || !list) return;

    // Otvaranje / zatvaranje na klik dugmeta
    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      list.classList.toggle('open');
    };

    // Odabir opcije
    const options = list.querySelectorAll('.custom-option');
    options.forEach(function (opt) {
      opt.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();

        options.forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');

        const val = opt.getAttribute('data-value') || 'koverat';
        const labelText = opt.querySelector('span') ? opt.querySelector('span').textContent.trim() : val;
        const svgEl = opt.querySelector('svg');

        self.selectedStyle = labelText;
        if (hiddenInput) hiddenInput.value = val;

        if (content && svgEl) {
          content.innerHTML = `${svgEl.outerHTML}<span>${labelText}</span>`;
        }

        list.classList.remove('open');
      };
    });

    // Zatvaranje ako se klikne bilo gde van menija
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove('open');
      }
    });
  },

  // Povezivanje događaja
  bindEvents: function () {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', (e) => {
        this.updateSizeInfo(e.target.value);
      });
    }

    const interiorSelect = document.getElementById('bumInteriorSelect');
    if (interiorSelect) {
      interiorSelect.addEventListener('change', (e) => {
        this.toggleCustomInterior(e.target.value);
      });
    }
  },

  // Prikupljanje unosa iz svih polja
  collectFormData: function () {
    const colorInput = document.getElementById('bumColorInput');
    const interiorSelect = document.getElementById('bumInteriorSelect');
    const customInteriorInput = document.getElementById('bumCustomInteriorInput');
    const mechanismSelect = document.getElementById('bumMechanismSelect');
    const customSideInput = document.getElementById('bumCustomSideInput');
    const notes = document.getElementById('bumNotes');

    let interiorVal = interiorSelect ? interiorSelect.value : 'Standardni';
    if (interiorVal === 'custom') {
      const customText = customInteriorInput ? customInteriorInput.value.trim() : '';
      interiorVal = customText ? `Po sopstvenoj želji: ${customText}` : 'Po sopstvenoj želji';
    }

    const fillings = [];
    if (this.currentPkg !== 'empty') {
      if (this.sideTheme === 'coffee') {
        document.querySelectorAll('#bumCoffeeGroup input[type="checkbox"]:checked').forEach((chk) => {
          fillings.push(chk.parentElement.textContent.trim());
        });
      } else if (this.sideTheme === 'custom_sides') {
        const customSideText = customSideInput ? customSideInput.value.trim() : '';
        fillings.push(customSideText ? `Po sopstvenoj želji: ${customSideText}` : 'Po sopstvenoj želji');
      } else {
        document.querySelectorAll('#bumSweetsGroup input[type="checkbox"]:checked').forEach((chk) => {
          fillings.push(chk.parentElement.textContent.trim());
        });
      }
    }

    return {
      package: this.currentPkg,
      size: document.getElementById('bumSizeSelect') ? document.getElementById('bumSizeSelect').value : '15x15x15',
      color: colorInput ? colorInput.value.trim() : '',
      interior: interiorVal,
      style: this.selectedStyle,
      mechanism: mechanismSelect ? mechanismSelect.value : 'cubes',
      fillings: fillings,
      notes: notes ? notes.value.trim() : ''
    };
  },

  // Slanje narudžbe na WhatsApp
  sendWhatsApp: function () {
    const data = this.collectFormData();
    const pkgLabels = {
      empty: '1. Prazna BUM kutija',
      sweets_gift: '2. BUM kutija sa punjenim stranama',
      only_sweets: '3. BUM kutija punjena slatkišima / kafom',
      custom_gift: '4. Personalizovani BUM poklon'
    };

    let msg = `Pozdrav! Želim poručiti BUM kutiju:\n\n`;
    msg += `📦 Paket: ${pkgLabels[data.package] || data.package}\n`;
    msg += `📏 Veličina: ${data.size}\n`;
    msg += `🎨 Boja: ${data.color || 'Standardna'}\n`;
    msg += `✨ Dekoracija enterijera: ${data.interior}\n`;
    msg += `📐 Stil ivica: ${data.style}\n`;
    msg += `⚙️ Mehanizam: ${data.mechanism === 'cubes' ? 'Iskačuće pop-up kocke' : data.mechanism}\n`;

    if (data.fillings.length > 0) {
      msg += `🍬 Punjenje stranica: ${data.fillings.join(', ')}\n`;
    }
    if (data.notes) {
      msg += `📝 Povod / opis želje: ${data.notes}\n`;
    }

    const phone = '381644667485';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.bumBox.init();
});
