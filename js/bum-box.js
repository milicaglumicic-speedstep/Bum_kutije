import { DB } from './database.js';
import { PricingEngine } from './pricing-engine.js';

export const BumBoxModule = {
  currentPackage: 'empty',
  selectedStyle: 'Zvezda',

  giftDimensions: {
    Kompaktna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~6 × 6 cm (visina do 4.5 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se po 1 čokoladica (ukupno 4).</small>',
    Standardna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~9 × 9 cm (visina do 8 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    Velika: '📏 <strong>Dimenzije mesta za poklon:</strong> ~12 × 12 cm (visina do 10 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    CUSTOM: '✨ <strong>Mesto za poklon:</strong> Izrađuje se tačno po meri vašeg 3D printovanog modela ili poklona (do 20 × 20 × 20 cm).'
  },

  init() {
    this.render3DOptions();
    this.bindEvents();
    this.updateSizeOptions();
    this.calculatePrice();
  },

  render3DOptions() {
    const container = document.getElementById('bambu3DContainer');
    if (!container) return;

    let html = `
      <label>Unikatni 3D štampani poklon (Bambu Lab izrada):</label>
      <select id="bambu3DSelect">
        <option value="">-- Koristim svoj lični poklon (bez 3D štampe) --</option>`;

    for (const [key, item] of Object.entries(DB.printing_3d.catalog)) {
      html += `<option value="${key}">${item.name} (+${item.base_markup_rsd} RSD)</option>`;
    }
    html += `</select>

      <div style="margin-top: 12px;">
        <label>Izaberi boju 3D poklona:</label>
        <select id="bambu3DColor">
          ${DB.printing_3d.available_colors.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </div>`;

    container.innerHTML = html;
  },

  bindEvents() {
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPackage(e.target.dataset.pkg));
    });

    document.getElementById('bumSizeSelect').addEventListener('change', () => {
      this.updateGiftInfo();
      this.calculatePrice();
    });

    document.getElementById('bumMechanismSelect').addEventListener('change', () => this.calculatePrice());
    document.getElementById('bambu3DSelect')?.addEventListener('change', () => this.calculatePrice());
    document.querySelectorAll('#bumSweetsGroup input[type="checkbox"]').forEach(c => {
      c.addEventListener('change', () => this.calculatePrice());
    });
  },

  selectStyle(name, element) {
    this.selectedStyle = name;
    document.querySelectorAll('#bumView .style-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
  },

  switchPackage(pkg) {
    this.currentPackage = pkg;
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.pkg === pkg);
    });

    const isCustom = (pkg === 'custom_gift');
    document.getElementById('bambu3DSection').style.display = isCustom ? 'block' : 'none';
    document.getElementById('customNotesGroup').style.display = isCustom ? 'block' : 'none';

    const showSweets = (pkg === 'sweets_gift' || pkg === 'only_sweets');
    document.getElementById('bumSweetsGroup').style.display = showSweets ? 'block' : 'none';

    this.updateSizeOptions();
    this.calculatePrice();
  },

  updateSizeOptions() {
    const select = document.getElementById('bumSizeSelect');
    select.innerHTML = '';

    if (this.currentPackage === 'custom_gift') {
      select.innerHTML = '<option value="CUSTOM">Prilagođava se 3D poklonu (do 20 × 20 × 20 cm)</option>';
    } else if (this.currentPackage === 'only_sweets') {
      select.innerHTML = `
        <option value="Standardna">Midi (15 × 15 × 15 cm) — 150g ispod čepa</option>
        <option value="Velika">Maxi (18 × 18 × 18 cm) — 250g ispod čepa</option>`;
    } else {
      select.innerHTML = `
        <option value="Kompaktna">Kompaktna (10 × 10 × 10 cm)</option>
        <option value="Standardna" selected>Standardna (15 × 15 × 15 cm)</option>
        <option value="Velika">Velika (18 × 18 × 18 cm)</option>`;
    }
    this.updateGiftInfo();
  },

  updateGiftInfo() {
    const size = document.getElementById('bumSizeSelect').value;
    const box = document.getElementById('bumGiftDimInfo');
    if (box) box.innerHTML = this.giftDimensions[size] || '';
  },

  calculatePrice() {
    const size = document.getElementById('bumSizeSelect').value;
    const mechanism = document.getElementById('bumMechanismSelect').value;
    const selected3D = document.getElementById('bambu3DSelect')?.value || null;

    let chosenSweets = [];
    document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => chosenSweets.push(el.value));

    const total = PricingEngine.calculateBumBox({
      packageType: this.currentPackage,
      size,
      mechanism,
      chosenSweets,
      selected3DItem: selected3D
    });

    document.getElementById('bumPriceDisplay').innerText = total.toLocaleString('sr-RS') + ' RSD';
  }
};
