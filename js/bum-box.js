window.bumBox = {
  currentPackage: 'empty',
  selectedStyle: 'Zvezda',
  giftDimensions: {
    Kompaktna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~6 × 6 cm (visina do 4.5 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavlja se po 1 čokoladica (ukupno 4).</small>',
    Standardna: '📏 <strong>Dimenzije mesta za poklon:</strong> ~9 × 9 cm (visina do 8 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    Velika: '📏 <strong>Dimenzije mesta za poklon:</strong> ~12 × 12 cm (visina do 10 cm)<br><small style="color:var(--accent-light);">* Na bočnim stranicama postavljaju se po 4 čokoladice (ukupno 16).</small>',
    CUSTOM: '✨ <strong>Mesto za poklon:</strong> Izrađuje se tačno po meri vašeg 3D printovanog modela ili poklona (do 20 × 20 × 20 cm).'
  },
  mount(container) {
    container.innerHTML = `
      <div id="bumView">
        <button class="back-nav" onclick="showSection('homeScreen')">← Nazad na izbor poklona</button>

        <div class="box-card">
          <h2 style="margin-bottom:12px;">BUM KUTIJA KONFIGURATOR</h2>
          <div class="tabs" id="bumTabs">
            <button class="tab-btn active" data-pkg="empty">1. Prazna BUM kutija</button>
            <button class="tab-btn" data-pkg="sweets_gift">2. Sa slatkim stranama</button>
            <button class="tab-btn" data-pkg="only_sweets">3. Samo sa slatkišima</button>
            <button class="tab-btn" data-pkg="custom_gift">4. Personalizovana (Bambu 3D)</button>
          </div>

          <div class="form-group">
            <label for="bumSizeSelect">Veličina kutije:</label>
            <select id="bumSizeSelect"></select>
            <div id="bumGiftDimInfo" class="gift-info-box"></div>
          </div>

          <div class="form-group">
            <label for="bumColorInput">Željena boja hamera i detalja:</label>
            <input type="text" id="bumColorInput" placeholder="npr. crna, crvena, ljubičasta, teget...">
          </div>

          <div class="form-group">
            <label>Stil bočnih ivica (za slatkiše):</label>
            <div class="style-grid">
              <div class="style-option selected" onclick="window.bumBox.selectStyle('Zvezda', this)">
                <div class="style-preview">
                  <svg viewBox="0 0 40 40" fill="none" stroke="#c084fc" stroke-width="1.8">
                    <rect x="4" y="4" width="32" height="32" rx="3" stroke="#6b7280" />
                    <path d="M4 4L36 36M36 4L4 36" />
                    <circle cx="20" cy="20" r="3" fill="#c084fc" />
                  </svg>
                </div>
                <span class="style-text">Zvezda (koverat u centar)</span>
              </div>

              <div class="style-option" onclick="window.bumBox.selectStyle('Šestougaonik', this)">
                <div class="style-preview">
                  <svg viewBox="0 0 40 40" fill="none" stroke="#c084fc" stroke-width="1.8">
                    <rect x="4" y="4" width="32" height="32" rx="3" stroke="#6b7280" />
                    <polygon points="20,6 33,13 33,27 20,34 7,27 7,13" />
                    <line x1="20" y1="20" x2="20" y2="6" /><line x1="20" y1="20" x2="33" y2="13" />
                    <line x1="20" y1="20" x2="33" y2="27" /><line x1="20" y1="20" x2="20" y2="34" />
                    <line x1="20" y1="20" x2="7" y2="27" /><line x1="20" y1="20" x2="7" y2="13" />
                    <circle cx="20" cy="20" r="2.5" fill="#c084fc" />
                  </svg>
                </div>
                <span class="style-text">Šestougaonik (6 trouglova)</span>
              </div>

              <div class="style-option" onclick="window.bumBox.selectStyle('X greda', this)">
                <div class="style-preview">
                  <svg viewBox="0 0 40 40" fill="none" stroke="#c084fc" stroke-width="2">
                    <rect x="4" y="4" width="32" height="32" rx="3" stroke="#6b7280" />
                    <line x1="6" y1="6" x2="34" y2="34" /><line x1="34" y1="6" x2="6" y2="34" />
                    <circle cx="20" cy="9" r="2.5" fill="#f59e0b" /><circle cx="31" cy="20" r="2.5" fill="#f59e0b" />
                    <circle cx="20" cy="31" r="2.5" fill="#f59e0b" /><circle cx="9" cy="20" r="2.5" fill="#f59e0b" />
                  </svg>
                </div>
                <span class="style-text">X greda (dijagonale)</span>
              </div>

              <div class="style-option" onclick="window.bumBox.selectStyle('Stepenik', this)">
                <div class="style-preview">
                  <svg viewBox="0 0 40 40" fill="none" stroke="#c084fc" stroke-width="2">
                    <rect x="4" y="4" width="32" height="32" rx="3" stroke="#6b7280" />
                    <path d="M8 32H15V24H23V16H31V8" />
                    <circle cx="11.5" cy="27" r="2.2" fill="#f59e0b" /><circle cx="19" cy="19.5" r="2.2" fill="#f59e0b" /><circle cx="27" cy="12" r="2.2" fill="#f59e0b" />
                  </svg>
                </div>
                <span class="style-text">Stepenik (cik-cak kaskada)</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="bumMechanismSelect">Unutrašnji mehanizam (sa konfetama):</label>
            <select id="bumMechanismSelect">
              <option value="cubes">6 iskačućih pop-up kocki</option>
              <option value="butterflies">6 iskačućih letećih leptirova</option>
              <option value="combo">Kombinovano (Kocke + Leptiri)</option>
            </select>
          </div>

          <div class="form-group" id="bambu3DSection" style="display:none; background:rgba(147,51,234,0.08); padding:16px; border-radius:10px; border:1px solid rgba(192,132,252,0.3);">
            <div id="bambu3DContainer"></div>
          </div>

          <div class="form-group" id="bumSweetsGroup" style="display:none;">
            <label>Izaberi slatkiše za stranice:</label>
            <div class="checkbox-group">
              <label class="checkbox-item"><input type="checkbox" value="ferrero" checked> Ferrero Rocher</label>
              <label class="checkbox-item"><input type="checkbox" value="raffaello" checked> Raffaello</label>
              <label class="checkbox-item"><input type="checkbox" value="lindor"> Lindt Lindor</label>
              <label class="checkbox-item"><input type="checkbox" value="mozart"> Mozart kugle</label>
            </div>
          </div>

          <div class="form-group" id="customNotesGroup" style="display:none;">
            <label for="bumNotes">Opis i posveta za 3D poklon / temu:</label>
            <textarea id="bumNotes" rows="3" placeholder="Ime za privezak, natpis ili opis vašeg poklona..."></textarea>
          </div>

          <div class="price-box">
            <div class="price-title">Kalkulisana cena BUM kutije</div>
            <div class="price-val" id="bumPriceDisplay">2.800 RSD</div>
          </div>

          <button class="submit-btn" onclick="window.bumBox.sendWhatsApp()">Naruči BUM kutiju na WhatsApp 💬</button>
        </div>
      </div>
    `;
    this.render3DOptions();
    this.bindEvents();
    this.updateSizeOptions();
    this.calculatePrice();
  },
  render3DOptions() {
    const container = document.getElementById('bambu3DContainer');
    if (!container || !window.DB) return;
    let html = '<label>Unikatni 3D štampani poklon (Bambu Lab izrada):</label><select id="bambu3DSelect"><option value="">-- Koristim svoj lični poklon --</option>';
    for (const [key, item] of Object.entries(window.DB.printing_3d.catalog)) {
      html += '<option value="' + key + '">' + item.name + ' (+' + item.base_markup_rsd + ' RSD)</option>';
    }
    html += '</select><div style="margin-top:12px;"><label>Boja 3D poklona:</label><select id="bambu3DColor">' +
      window.DB.printing_3d.available_colors.map(c => '<option value="' + c + '">' + c + '</option>').join('') +
      '</select></div>';
    container.innerHTML = html;
  },
  bindEvents() {
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPackage(e.target.dataset.pkg));
    });
    document.getElementById('bumSizeSelect')?.addEventListener('change', () => { this.updateGiftInfo(); this.calculatePrice(); });
    document.getElementById('bumMechanismSelect')?.addEventListener('change', () => this.calculatePrice());
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
    document.querySelectorAll('#bumTabs .tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.pkg === pkg));
    const isCustom = (pkg === 'custom_gift');
    const b3d = document.getElementById('bambu3DSection');
    const notes = document.getElementById('customNotesGroup');
    const sweets = document.getElementById('bumSweetsGroup');
    if (b3d) b3d.style.display = isCustom ? 'block' : 'none';
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
      select.innerHTML = '<option value="CUSTOM">Prilagođava se 3D poklonu (do 20 × 20 × 20 cm)</option>';
    } else if (this.currentPackage === 'only_sweets') {
      select.innerHTML = '<option value="Standardna">Midi (15 × 15 × 15 cm) — 150g ispod čepa</option><option value="Velika">Maxi (18 × 18 × 18 cm) — 250g ispod čepa</option>';
    } else {
      select.innerHTML = '<option value="Kompaktna">Kompaktna (10 × 10 × 10 cm)</option><option value="Standardna" selected>Standardna (15 × 15 × 15 cm)</option><option value="Velika">Velika (18 × 18 × 18 cm)</option>';
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
    const selected3D = document.getElementById('bambu3DSelect')?.value || null;
    let chosenSweets = [];
    document.querySelectorAll('#bumSweetsGroup input:checked').forEach(el => chosenSweets.push(el.value));
    if (!window.PricingEngine) return;
    const total = window.PricingEngine.calculateBumBox({
      packageType: this.currentPackage, size, mechanism, chosenSweets, selected3DItem: selected3D
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
    const print3D = document.getElementById('bambu3DSelect')?.value;
    const printColor = document.getElementById('bambu3DColor')?.value;
    const notes = document.getElementById('bumNotes')?.value.trim();

    let text = `Pozdrav! Šaljem upit za BUM KUTIJU 🎁\n\n` +
               `*Paket:* ${this.currentPackage}\n` +
               `*Veličina:* ${size}\n` +
               `*Stil stranica:* ${this.selectedStyle}\n` +
               `*Boja kutije:* ${color}\n` +
               `*Mehanizam:* ${mech}\n` +
               `*Cena:* ${price}`;
    if (this.currentPackage === 'custom_gift' && print3D) {
      text += `\n*Bambu Lab 3D Poklon:* ${print3D} (Boja: ${printColor})`;
    }
    if (notes) text += `\n*Posebne napomene:* ${notes}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  }
};