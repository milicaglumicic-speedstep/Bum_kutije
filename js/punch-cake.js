window.punchCake = {
  calculatedTiers: 1,
  withToys: false,
  init() {
    this.bindEvents();
    this.handleHolesChange();
  },
  bindEvents() {
    document.getElementById('punchHolesInput')?.addEventListener('input', () => this.handleHolesChange());
    document.getElementById('sweetsPerHoleSelect')?.addEventListener('change', () => this.calculatePrice());
    document.querySelectorAll('#punchSweetsGroup input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const checked = document.querySelectorAll('#punchSweetsGroup input:checked');
        if (checked.length > 4) {
          e.target.checked = false;
          alert('Možete izabrati maksimalno do 4 vrste slatkiša!');
        } else if (checked.length === 0) {
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
    let sweetsPerHole = parseInt(document.getElementById('sweetsPerHoleSelect')?.value, 10) || 2;
    let selectedSweets = [];
    document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => selectedSweets.push(el.value));
    if (!window.PricingEngine) return;
    const total = window.PricingEngine.calculatePunchCake({
      holes, tiers: this.calculatedTiers, sweetsPerHole, selectedSweets, withToys: this.withToys
    });
    const disp = document.getElementById('punchPriceDisplay');
    if (disp) disp.innerText = total.toLocaleString('sr-RS') + ' RSD';
  },
  sendWhatsApp() {
    const phone = "381644667485";
    const color = document.getElementById('punchColorInput')?.value || 'Po dogovoru';
    const theme = document.getElementById('punchThemeInput')?.value || 'Rođendanska';
    const holes = document.getElementById('punchHolesInput')?.value || '16';
    const sweetsPerHole = document.getElementById('sweetsPerHoleSelect')?.value || '2';
    const price = document.getElementById('punchPriceDisplay')?.innerText || '3.800 RSD';
    const notes = document.getElementById('punchNotes')?.value.trim();
    let sweets = [];
    document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => sweets.push(el.value));

    let text = 'Pozdrav! Šaljem upit za PUNCH ROĐENDANSKU TORTU 🎂🎈\n\n' +
               '*Tema:* ' + theme + '\n' +
               '*Boja torte:* ' + color + '\n' +
               '*Broj pregrada:* ' + holes + ' rupa (' + this.calculatedTiers + ' sprat/a)\n' +
               '*Slatkiša po rupi:* ' + sweetsPerHole + '\n' +
               '*Izabrani slatkiši (1-4):* ' + (sweets.join(', ') || 'Standardni miks') + '\n' +
               '*Dodaci:* ' + (this.withToys ? 'Slatkiši + Igračkice/Privesci' : 'Samo slatkiši') + '\n' +
               '*Cena:* ' + price;
    if (notes) text += '\n*Slavljenik i želje:* ' + notes;
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
  }
};
document.addEventListener('DOMContentLoaded', () => { if (window.punchCake?.init) window.punchCake.init(); });