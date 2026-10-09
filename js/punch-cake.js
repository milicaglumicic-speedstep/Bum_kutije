window.punchCake = {
  calculatedTiers: 1,
  withToys: false,

  init() {
    this.bindEvents();
    this.handleHolesChange();
  },

  // Pomoćna metoda za dobijanje trenutnog broja komada po rupi
  getSweetsPerHoleCount() {
    const select = document.getElementById('sweetsPerHoleSelect');
    if (!select) return 2;

    if (select.value === 'custom') {
      const customInput = document.getElementById('customSweetsPerHoleInput');
      const val = parseInt(customInput?.value, 10);
      return (isNaN(val) || val < 1) ? 1 : val;
    }

    return parseInt(select.value, 10) || 2;
  },

  bindEvents() {
    document.getElementById('punchHolesInput')?.addEventListener('input', () => this.handleHolesChange());

    const sweetsSelect = document.getElementById('sweetsPerHoleSelect');
    const customWrap = document.getElementById('customSweetsPerHoleWrap');
    const customInput = document.getElementById('customSweetsPerHoleInput');

    // Prebacivanje između 1, 2, 3 i custom polja
    sweetsSelect?.addEventListener('change', () => {
      const isCustom = sweetsSelect.value === 'custom';
      if (customWrap) customWrap.style.display = isCustom ? 'block' : 'none';
      this.calculatePrice();
    });

    customInput?.addEventListener('input', () => {
      this.calculatePrice();
    });

    // ─── OVDJE JE BIO PROBLEM: DODAJEMO SLUŠAOCE KLIKOVA ZA POKLONE ───
    document.getElementById('fillOptSlatkisi')?.addEventListener('click', () => {
      this.setWithToys(false);
    });

    document.getElementById('fillOptMix')?.addEventListener('click', () => {
      this.setWithToys(true);
    });
    // ──────────────────────────────────────────────────────────────────

    // Validacija slatkiša
    document.querySelectorAll('#punchSweetsGroup input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const checked = document.querySelectorAll('#punchSweetsGroup input:checked');
       if (checked.length === 0) {
          e.target.checked = true;
          alert('Morate izabrati barem 1 vrstu slatkiša!');
        }
        this.calculatePrice();
      });
    });
  },

  handleHolesChange() {
    let holes = parseInt(document.getElementById('punchHolesInput')?.value, 10);
    if (isNaN(holes) || holes < 6) holes = 6;
    const tierBox = document.getElementById('tierInfoBox');
    if (holes <= 16) {
      this.calculatedTiers = 1;
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 1 SPRAT</strong><br>Za <strong>' + holes + ' pregrada</strong> dovoljan je 1 nivo (prečnik ~26 cm). Idealno za manje proslave!';
    } else if (holes <= 32) {
      this.calculatedTiers = 2;
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 2 SPRATA (Dvospratna torta)</strong><br>Za <strong>' + holes + ' pregrada</strong> torta ima bazu + gornji sprat radi lakšeg bušenja.';
    } else {
      this.calculatedTiers = 3;
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 3 SPRATA (Mega trospratna torta)</strong><br>Raskošna konstrukcija na 3 sprata za <strong>' + holes + ' pregrada</strong>!';
    }
    this.calculatePrice();
  },

  setWithToys(val) {
    this.withToys = val;
    document.getElementById('fillOptSlatkisi')?.classList.toggle('selected', !val);
    document.getElementById('fillOptMix')?.classList.toggle('selected', val);
    this.calculatePrice();
  },

  calculatePrice() {
    let holes = parseInt(document.getElementById('punchHolesInput')?.value, 10) || 16;
    let sweetsPerHole = this.getSweetsPerHoleCount();
    let selectedSweets = [];
    document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => selectedSweets.push(el.value));

    if (!window.PricingEngine) return;
    const total = window.PricingEngine.calculatePunchCake({
      holes,
      tiers: this.calculatedTiers,
      sweetsPerHole,
      selectedSweets,
      withToys: this.withToys
    });

    const disp = document.getElementById('punchPriceDisplay');
    if (disp) disp.innerText = total.toLocaleString('sr-RS') + ' RSD';
  },

  sendWhatsApp() {
    const phone = "381644667485";
    const color = document.getElementById('punchColorInput')?.value || 'Po dogovoru';
    const theme = document.getElementById('punchThemeInput')?.value || 'Rođendanska';
    const holes = document.getElementById('punchHolesInput')?.value || '16';
    const sweetsCount = this.getSweetsPerHoleCount();
    const price = document.getElementById('punchPriceDisplay')?.innerText || '3.800 RSD';
    const notes = document.getElementById('punchNotes')?.value.trim();

    let sweets = [];
    document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => sweets.push(el.value));

    let text = 'Pozdrav! Šaljem upit za PUNCH ROĐENDANSKA TORTU 🎂🎈\n\n' +
               '*Tema:* ' + theme + '\n' +
               '*Boja torte:* ' + color + '\n' +
               '*Broj pregrada:* ' + holes + ' rupa (' + this.calculatedTiers + ' sprat/a)\n' +
               '*Slatkiša po rupi:* ' + sweetsCount + ' kom.\n' +
               '*Izabrani slatkiši (1-4):* ' + (sweets.join(', ') || 'Standardni miks') + '\n' +
               '*Dodaci:* ' + (this.withToys ? 'Slatkiši + Igračkice/Privesci' : 'Samo slatkiši') + '\n' +
               '*Cena:* ' + price;

    if (notes) text += '\n*Slavljenik i želje:* ' + notes;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => { 
  if (window.punchCake?.init) window.punchCake.init(); 
});
