window.bumBox = {
  giftDimensions: {
    '11x8x10': '📏 <strong>Dimenzije kutije:</strong> 11 × 8 × 10 cm<br><small style="color:var(--accent-light);">* Kompaktna mera idealna za prirodnu kozmetiku, nakit, sat ili slatki paket.</small>',
    '15x15x12': '📏 <strong>Dimenzije kutije:</strong> 15 × 15 × 12 cm<br><small style="color:var(--accent-light);">* Prostrana kutija za veće poklone, bogate slatke pakete i kombinovane setove.</small>',
    'custom': '✨ <strong>Custom izrada po meri:</strong> Unesite željenu dužinu, širinu i visinu u poljima iznad.'
  },

  init() {
    this.bindEvents();
    this.updateGiftInfo();
    this.updateColorInputs();
    this.updateSidesSections();
    this.updateUnderCapSections();
  },

  bindEvents() {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        const isCustom = sizeSelect.value === 'custom';
        const customSec = document.getElementById('customDimSection');
        if (customSec) customSec.style.display = isCustom ? 'block' : 'none';
        this.updateGiftInfo();
      });
    }

    ['customD', 'customS', 'customV'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        this.updateGiftInfo();
      });
    });

    document.getElementById('bumColorCountSelect')?.addEventListener('change', () => {
      this.updateColorInputs();
    });

    document.getElementById('bumSidesTypeSelect')?.addEventListener('change', () => {
      this.updateSidesSections();
    });

    document.getElementById('underCapSelect')?.addEventListener('change', () => {
      this.updateUnderCapSections();
    });
  },

  updateColorInputs() {
    const count = parseInt(document.getElementById('bumColorCountSelect')?.value || '1', 10);
    const wrap2 = document.getElementById('bumColor2Wrap');
    const label1 = document.getElementById('bumColor1Label');
    if (wrap2) wrap2.style.display = count === 2 ? 'block' : 'none';
    if (label1) label1.innerText = count === 2 ? 'Prva boja (spoljašnjost / baza):' : 'Željena boja kutije:';
  },

  updateSidesSections() {
    const type = document.getElementById('bumSidesTypeSelect')?.value || 'sweets';
    const sweetsSec = document.getElementById('sidesSweetsSection');
    const decorSec = document.getElementById('sidesDecorSection');
    if (sweetsSec) sweetsSec.style.display = type === 'sweets' ? 'block' : 'none';
    if (decorSec) decorSec.style.display = type === 'decor_2d' ? 'block' : 'none';
  },

  updateUnderCapSections() {
    const val = document.getElementById('underCapSelect')?.value || 'sweets';
    const secSweets = document.getElementById('underCapSweetsSection');
    const secCosm = document.getElementById('underCapCosmeticsSection');
    const secCustom = document.getElementById('underCapCustomSection');

    if (secSweets) secSweets.style.display = val === 'sweets' ? 'block' : 'none';
    if (secCosm) secCosm.style.display = val === 'cosmetics' ? 'block' : 'none';
    if (secCustom) secCustom.style.display = val === 'custom_gift' ? 'block' : 'none';
  },

  updateGiftInfo() {
    const size = document.getElementById('bumSizeSelect')?.value || '11x8x10';
    const box = document.getElementById('bumGiftDimInfo');
    if (!box) return;
    if (size === 'custom') {
      const d = document.getElementById('customD')?.value || 12;
      const s = document.getElementById('customS')?.value || 12;
      const v = document.getElementById('customV')?.value || 10;
      box.innerHTML = `✨ <strong>Izabrana Custom dimenzija:</strong> ${d} × ${s} × ${v} cm`;
    } else {
      box.innerHTML = this.giftDimensions[size] || '';
    }
  },

  sendWhatsApp() {
    const phone = "381644667485";
    const sizeVal = document.getElementById('bumSizeSelect')?.value || '11x8x10';
    let sizeText = sizeVal.replace(/x/g, ' × ') + ' cm';
    if (sizeVal === 'custom') {
      const d = document.getElementById('customD')?.value || 12;
      const s = document.getElementById('customS')?.value || 12;
      const v = document.getElementById('customV')?.value || 10;
      sizeText = `Custom (${d} × ${s} × ${v} cm)`;
    }

    const colorCount = parseInt(document.getElementById('bumColorCountSelect')?.value || '1', 10);
    const c1 = document.getElementById('bumColor1Input')?.value.trim() || 'Po dogovoru';
    const c2 = document.getElementById('bumColor2Input')?.value.trim() || 'Po dogovoru';
    const colorText = colorCount === 2 ? `2 boje (${c1} + ${c2})` : `1 boja (${c1})`;

    const mechSelect = document.getElementById('bumMechanismSelect');
    const mech = mechSelect ? mechSelect.options[mechSelect.selectedIndex].text : 'Pop-Up kocke';

    const sidesType = document.getElementById('bumSidesTypeSelect')?.value || 'sweets';
    let sidesDesc = '';
    if (sidesType === 'sweets') {
      const sideSweetKey = document.getElementById('bumSideSweetSelect')?.value || 'kinder_cokoladica';
      const sweetName = window.DB.sweets_database[sideSweetKey]?.name || sideSweetKey;
      sidesDesc = `Slatkiši (${sweetName})`;
    } else {
      const decorTxt = document.getElementById('sidesDecorInput')?.value.trim() || 'Fotografije / 2D ukrasi';
      sidesDesc = `Ukrasi / 2D predmeti (${decorTxt})`;
    }

    const underCapType = document.getElementById('underCapSelect')?.value || 'sweets';
    let underCapDesc = '';
    if (underCapType === 'sweets') {
      const capSweetKey = document.getElementById('bumUnderCapSweetSelect')?.value || 'kinder_cokoladica';
      const capSweetName = window.DB.sweets_database[capSweetKey]?.name || capSweetKey;
      underCapDesc = `Slatkiši (${capSweetName})`;
    } else if (underCapType === 'cosmetics') {
      underCapDesc = window.DB.cosmetics_combo.name;
    } else {
      const customGiftTxt = document.getElementById('underCapCustomNotes')?.value.trim() || 'Sopstveni poklon';
      underCapDesc = `Personalizovano (${customGiftTxt})`;
    }

    const notes = document.getElementById('bumNotes')?.value.trim();

    let text = 'Pozdrav! Šaljem porudžbinu za BUM KUTIJU 🎁\n\n' +
               '*Veličina:* ' + sizeText + '\n' +
               '*Boja:* ' + colorText + '\n' +
               '*Mehanizam:* ' + mech + '\n' +
               '*Punjenje stranica:* ' + sidesDesc + '\n' +
               '*Punjenje ispod čepa:* ' + underCapDesc;

    if (notes) text += '\n*Napomena:* ' + notes;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.bumBox?.init) window.bumBox.init();
});
