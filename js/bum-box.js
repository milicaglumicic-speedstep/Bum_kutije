/**
 * js/bum-box.js
 * Glavna logika za BUM KUTIJA konfigurator
 */

window.bumBox = {
  currentPkg: 'empty',
  selectedStyle: 'Koverat (do 3 slatkiša)',
  sideTheme: 'sweets',

  init: function () {
    this.initTabs();
    this.populateSizes();
    this.initSideDropdown();
    this.bindEvents();
  },

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

  selectPackage: function (pkg) {
    this.currentPkg = pkg;

    const sideThemeGroup = document.getElementById('sideThemeGroup');
    const sweetsGroup = document.getElementById('bumSweetsGroup');
    const coffeeGroup = document.getElementById('bumCoffeeGroup');
    const customSideGroup = document.getElementById('bumCustomSideGroup');
    const notesGroup = document.getElementById('customNotesGroup');
    const customGiftWrap = document.getElementById('bumCustomGiftWrap');

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

    const sizeSelect = document.getElementById('bumSizeSelect');
    if (customGiftWrap && sizeSelect && sizeSelect.value !== 'custom_size') {
      customGiftWrap.style.display = 'none';
    }
  },

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

  populateSizes: function () {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (!sizeSelect) return;

    const sizes = (window.DB && window.DB.bumSizes) || [
      { id: '10x10x10', label: '10 × 10 × 10 cm (Mala)', giftDim: '6 × 6 × 8 cm' },
      { id: '15x15x15', label: '15 × 15 × 15 cm (Standardna)', giftDim: '10 × 10 × 12 cm' },
      { id: '18x18x18', label: '18 × 18 × 18 cm (Velika)', giftDim: '12 × 12 × 15 cm' }
    ];

    const currentVal = sizeSelect.value || '15x15x15';
    sizeSelect.innerHTML = '';

    sizes.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.label;
      if (s.id === currentVal) opt.selected = true;
      sizeSelect.appendChild(opt);
    });

    if (this.currentPkg === 'custom_gift') {
      const optCustom = document.createElement('option');
      optCustom.value = 'custom_size';
      optCustom.textContent = '✏️ Unesi dimenzije po želji...';
      if (currentVal === 'custom_size') optCustom.selected = true;
      sizeSelect.appendChild(optCustom);
    }

    this.updateSizeInfo(sizeSelect.value);
  },

  updateSizeInfo: function (val) {
    const dimInfo = document.getElementById('bumGiftDimInfo');
    const customGiftWrap = document.getElementById('bumCustomGiftWrap');
    const customGiftInput = document.getElementById('bumCustomGiftInput');

    if (val === 'custom_size') {
      if (dimInfo) dimInfo.style.display = 'none';
      if (customGiftWrap) {
        customGiftWrap.style.display = 'block';
        if (customGiftInput) customGiftInput.focus();
      }
      return;
    }

    if (customGiftWrap) customGiftWrap.style.display = 'none';
    if (dimInfo) dimInfo.style.display = 'block';

    let giftDim = '10 × 10 × 12 cm';
    if (val === '10x10x10') giftDim = '6 × 6 × 8 cm';
    if (val === '18x18x18') giftDim = '12 × 12 × 15 cm';

    if (dimInfo) {
      dimInfo.innerHTML = `📦 Unutrašnji prostor za poklon (centralni čep): <strong>${giftDim}</strong>`;
    }
  },

  initSideDropdown: function () {
    const btn = document.getElementById('sideDropdownBtn');
    const list = document.getElementById('sideOptionsList');
    const hiddenInput = document.getElementById('selectedSideStyle');
    const content = document.getElementById('sideSelectedContent');
    const self = this;

    if (!btn || !list) return;

    btn.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      list.classList.toggle('open');
    };

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

    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove('open');
      }
    });
  },

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

  collectFormData: function () {
    const colorInput = document.getElementById('bumColorInput');
    const sizeSelect = document.getElementById('bumSizeSelect');
    const customGiftInput = document.getElementById('bumCustomGiftInput');
    const interiorSelect = document.getElementById('bumInteriorSelect');
    const customInteriorInput = document.getElementById('bumCustomInteriorInput');
    const mechanismSelect = document.getElementById('bumMechanismSelect');
    const customSideInput = document.getElementById('bumCustomSideInput');
    const notes = document.getElementById('bumNotes');

    let sizeVal = sizeSelect ? sizeSelect.value : '15x15x15';
    if (sizeVal === 'custom_size') {
      const giftDim = customGiftInput ? customGiftInput.value.trim() : '';
      sizeVal = giftDim ? `Kutija po meri poklona (${giftDim})` : 'Kutija po meri poklona (dimenzije nisu unete)';
    }

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
      size: sizeVal,
      color: colorInput ? colorInput.value.trim() : '',
      interior: interiorVal,
      style: this.selectedStyle,
      mechanism: mechanismSelect ? mechanismSelect.value : 'cubes',
      fillings: fillings,
      notes: notes ? notes.value.trim() : ''
    };
  },

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
