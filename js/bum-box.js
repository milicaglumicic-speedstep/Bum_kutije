window.bumBox = {
  colorCount: 1,
  sidesType: 'sweets',
  selectedStyle: 'Zvezda',

  giftDimensions: {
    '11x8x10': '📏 <strong>Dimenzije kutije:</strong> 11 × 8 × 10v cm<br><small style="color:var(--accent-light);">* Kompaktna mera idealna za prirodnu kozmetiku, nakit, sat ili slatki paket.</small>',
    '15x15x12': '📏 <strong>Dimenzije kutije:</strong> 15 × 15 × 12v cm<br><small style="color:var(--accent-light);">* Prostrana kutija za veće poklone, bogate slatke pakete i kombinovane setove.</small>',
    'custom': '✨ <strong>Custom izrada po meri:</strong> Unesite željenu dužinu, širinu i visinu u poljima iznad.'
  },

  init() {
    this.bindEvents();
    this.updateGiftInfo();
    this.calculatePrice();
  },

  bindEvents() {
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (sizeSelect) {
      sizeSelect.addEventListener('change', () => {
        const isCustom = sizeSelect.value === 'custom';
        const customSec = document.getElementById('customDimSection');
        if (customSec) customSec.style.display = isCustom ? 'block' : 'none';
        this.updateGiftInfo();
        this.calculatePrice();
      });
    }

    ['customD', 'customS', 'customV'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        this.updateGiftInfo();
        this.calculatePrice();
      });
    });

    document.getElementById('bumMechanismSelect')?.addEventListener('change', () => this.calculatePrice());

    const underCapSelect = document.getElementById('underCapSelect');
    if (underCapSelect) {
      underCapSelect.addEventListener('change', () => {
        this.updateUnderCapSections();
        this.calculatePrice();
      });
    }

    document.querySelectorAll('#bumSidesSweetsGroup input[type="checkbox"], #bumUnderCapSweetsGroup input[type="checkbox"], #bumCosmeticsGroup input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => this.calculatePrice());
    });
  },

  setColorCount(count) {
    this.colorCount = count;
    document.getElementById('colorCount1Card')?.classList.toggle('selected', count === 1);
    document.getElementById('colorCount2Card')?.classList.toggle('selected', count === 2);
    const wrap2 = document.getElementById('bumColor2Wrap');
    const label1 = document.getElementById('bumColor1Label');
    if (wrap2) wrap2.style.display = count === 2 ? 'block' : 'none';
    if (label1) label1.innerText = count === 2 ? 'Prva boja (spoljašnjost / baza):' : 'Željena boja kutije:';
    this.calculatePrice();
  },

  setSidesType(type) {
    this.sidesType = type;
    document.getElementById('sidesOptSweets')?.classList.toggle('selected', type === 'sweets');
    document.getElementById('sidesOptDecor')?.classList.toggle('selected', type === 'decor_2d');
    const sweetsSec = document.getElementById('sidesSweetsSection');
    const decorSec = document.getElementById('sidesDecorSection');
    if (sweetsSec) sweetsSec.style.display = type === 'sweets' ? 'block' : 'none';
    if (decorSec) decorSec.style.display = type === 'decor_2d' ? 'block' : 'none';
    this.calculatePrice();
  },

  selectStyle(name, element) {
    this.selectedStyle = name;
    document.querySelectorAll('.style-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
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
      box.innerHTML = `✨ <strong>Izabrana Custom dimenzija:</strong> ${d} × ${s} × ${v}v cm`;
    } else {
      box.innerHTML = this.giftDimensions[size] || '';
    }
  },

  calculatePrice() {
    const size = document.getElementById('bumSizeSelect')?.value || '11x8x10';
    const mechanism = document.getElementById('bumMechanismSelect')?.value || 'cubes';
    const underCapType = document.getElementById('underCapSelect')?.value || 'sweets';

    let sidesSweets = [];
    document.querySelectorAll('#bumSidesSweetsGroup input:checked').forEach(el => sidesSweets.push(el.value));

    let underCapSweets = [];
    document.querySelectorAll('#bumUnderCapSweetsGroup input:checked').forEach(el => underCapSweets.push(el.value));

    let underCapCosmetics = [];
    document.querySelectorAll('#bumCosmeticsGroup input:checked').forEach(el => underCapCosmetics.push(el.value));

    if (!window.PricingEngine) return;
    const total = window.PricingEngine.calculateBumBox({
      size,
      colorCount: this.colorCount,
      mechanism,
      sidesType: this.sidesType,
      sidesSweets,
      underCapType,
      underCapSweets,
      underCapCosmetics
    });

    const disp = document.getElementById('bumPriceDisplay');
    if (disp) disp.innerText = total.toLocaleString('sr-RS') + ' RSD';
  },

  sendWhatsApp() {
    const phone = "381644667485";
    const sizeVal = document.getElementById('bumSizeSelect')?.value || '11x8x10';
    let sizeText = sizeVal;
    if (sizeVal === 'custom') {
      const d = document.getElementById('customD')?.value || 12;
      const s = document.getElementById('customS')?.value || 12;
      const v = document.getElementById('customV')?.value || 10;
      sizeText = `Custom (${d} × ${s} × ${v}v cm)`;
    }

    const c1 = document.getElementById('bumColor1Input')?.value.trim() || 'Po dogovoru';
    const c2 = document.getElementById('bumColor2Input')?.value.trim() || 'Po dogovoru';
    const colorText = this.colorCount === 2 ? `2 boje (${c1} + ${c2})` : `1 boja (${c1})`;

    const mechSelect = document.getElementById('bumMechanismSelect');
    const mech = mechSelect ? mechSelect.options[mechSelect.selectedIndex].text : 'Pop-Up kocke';

    let sidesDesc = '';
    if (this.sidesType === 'sweets') {
      let sList = [];
      document.querySelectorAll('#bumSidesSweetsGroup input:checked').forEach(el => {
        sList.push(window.DB.sweets_database[el.value]?.name || el.value);
      });
      sidesDesc = `Slatkiši (${sList.join(', ') || 'Po izboru'}) | Stil ivica: ${this.selectedStyle}`;
    } else {
      const decorTxt = document.getElementById('sidesDecorInput')?.value.trim() || 'Fotografije / 2D ukrasi';
      sidesDesc = `Ukrasi / 2D predmeti (${decorTxt})`;
    }

    const underCapType = document.getElementById('underCapSelect')?.value || 'sweets';
    let underCapDesc = '';
    if (underCapType === 'sweets') {
      let uList = [];
      document.querySelectorAll('#bumUnderCapSweetsGroup input:checked').forEach(el => {
        uList.push(window.DB.sweets_database[el.value]?.name || el.value);
      });
      underCapDesc = `Slatkiši (${uList.join(', ') || 'Miks'})`;
    } else if (underCapType === 'cosmetics') {
      let cList = [];
      document.querySelectorAll('#bumCosmeticsGroup input:checked').forEach(el => {
        cList.push(window.DB.cosmetics_database[el.value]?.name || el.value);
      });
      underCapDesc = `Prirodna kozmetika (${cList.join(', ') || 'Komplet'})`;
    } else {
      const customGiftTxt = document.getElementById('underCapCustomNotes')?.value.trim() || 'Sopstveni poklon';
      underCapDesc = `Personalizovano (${customGiftTxt})`;
    }

    const price = document.getElementById('bumPriceDisplay')?.innerText || 'Na upit';
    const notes = document.getElementById('bumNotes')?.value.trim();

    let text = 'Pozdrav! Šaljem porudžbinu za BUM KUTIJU 🎁\n\n' +
               '*Veličina:* ' + sizeText + '\n' +
               '*Boja:* ' + colorText + '\n' +
               '*Mehanizam:* ' + mech + '\n' +
               '*Punjenje stranica:* ' + sidesDesc + '\n' +
               '*Punjenje ispod čepa:* ' + underCapDesc + '\n' +
               '*Kalkulisana cena:* ' + price;

    if (notes) text += '\n*Napomena:* ' + notes;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.bumBox?.init) window.bumBox.init();
});
