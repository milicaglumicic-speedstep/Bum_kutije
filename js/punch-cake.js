window.punchCake = {
  calculatedTiers: 1,
  withToys: false,
  mount(container) {
    container.innerHTML = `
      <div id="punchView" class="punch-theme">
        <button class="back-nav" onclick="showSection('homeScreen')">← Nazad na izbor poklona</button>

        <div class="box-card">
          <h2 style="margin-bottom:12px;">PUNCH ROĐENDANSKA TORTA</h2>

          <div class="form-group">
            <label for="punchColorInput">Željena paleta / boja torte:</label>
            <input type="text" id="punchColorInput" placeholder="npr. tirkizna, vanila-zlatna, plava...">
          </div>

          <div class="form-group">
            <label for="punchThemeInput">Tema i motiv torte (crtani lik / interesovanja):</label>
            <input type="text" id="punchThemeInput" placeholder="npr. Bluey, Pepa Prase, Cars, Jednorozi, Paw Patrol...">
          </div>

          <div class="form-group">
            <label for="punchHolesInput">Željeni broj pregrada za bušenje (krugova):</label>
            <input type="number" id="punchHolesInput" value="16" min="6" max="50">
            <div id="tierInfoBox" class="punch-info-box"></div>
          </div>

          <div class="form-group">
            <label for="sweetsPerHoleSelect">Broj slatkiša po jednoj pregradi:</label>
            <select id="sweetsPerHoleSelect">
              <option value="1">1 slatkiš po rupi (standardno)</option>
              <option value="2" selected>2 slatkiša po rupi (bogatije)</option>
              <option value="3">3 slatkiša po rupi (maksimalno)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Izaberi 1 do 4 vrste slatkiša za punjenje:</label>
            <div class="checkbox-group" id="punchSweetsGroup">
              <label class="checkbox-item"><input type="checkbox" value="kinder_bueno" checked> Kinder Bueno (mini)</label>
              <label class="checkbox-item"><input type="checkbox" value="kinder_cokoladica" checked> Kinder čokoladica</label>
              <label class="checkbox-item"><input type="checkbox" value="lizalica" checked> Chupa Chups lizalica</label>
              <label class="checkbox-item"><input type="checkbox" value="bananica"> Krem bananica</label>
              <label class="checkbox-item"><input type="checkbox" value="sokic"> Sokić tetrapak (200ml)</label>
              <label class="checkbox-item"><input type="checkbox" value="euroblokic"> Euroblokić</label>
              <label class="checkbox-item"><input type="checkbox" value="najlepse_zeljice"> Najlepše željice</label>
            </div>
          </div>

          <div class="form-group">
            <label>Dodaci u pregradama:</label>
            <div class="radio-card-group">
              <div class="radio-card selected" id="fillOptSlatkisi" onclick="window.punchCake.setWithToys(false)">
                <div style="font-weight:600; color:#fff;">🍬 Samo slatkiši</div>
                <div style="font-size:0.82rem; color:var(--text-muted);">Samo izabrani slatkiši u svakoj pregradi.</div>
              </div>
              <div class="radio-card" id="fillOptMix" onclick="window.punchCake.setWithToys(true)">
                <div style="font-weight:600; color:#fff;">🎁 Slatkiši + Igračkice</div>
                <div style="font-size:0.82rem; color:var(--text-muted);">Slatkiš + tematski privezak, figurica ili narukvica (+70 RSD/rupi).</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="punchNotes">Ime slavljenika i broj godina:</label>
            <textarea id="punchNotes" rows="3" placeholder="npr. Luka, 6 godina. Zlatne zvezdice na vrhu..."></textarea>
          </div>

          <div class="price-box">
            <div class="price-title">Kalkulisana cena Punch torte</div>
            <div class="price-val" id="punchPriceDisplay">3.800 RSD</div>
          </div>

          <button class="submit-btn" onclick="window.punchCake.sendWhatsApp()">Naruči Punch tortu na WhatsApp 💬</button>
        </div>
      </div>
    `;
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
          alert('Možete izabrati najviše 4 različita slatkiša!');
        } else if (checked.length === 0) {
          e.target.checked = true;
          alert('Morate izabrati barem 1 slatkiš!');
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
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 1 SPRAT</strong><br>Za ' + holes + ' pregrada dovoljan je 1 nivo (prečnik ~26 cm).';
    } else if (holes <= 32) {
      this.calculatedTiers = 2;
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 2 SPRATA (Dvospratna torta)</strong><br>Za ' + holes + ' pregrada torta ima bazu + gornji sprat.';
    } else {
      this.calculatedTiers = 3;
      if (tierBox) tierBox.innerHTML = '🎂 <strong>Konstrukcija: 3 SPRATA (Mega trospratna torta)</strong><br>Raskošna konstrukcija na 3 sprata za ' + holes + ' pregrada!';
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

    let text = `Pozdrav! Šaljem upit za PUNCH ROĐENDANSKU TORTU 🎂🎈\n\n` +
               `*Tema:* ${theme}\n` +
               `*Boja torte:* ${color}\n` +
               `*Broj pregrada:* ${holes} rupa (${this.calculatedTiers} sprat/a)\n` +
               `*Slatkiša po rupi:* ${sweetsPerHole}\n` +
               `*Izabrani slatkiši:* ${sweets.join(', ') || 'Standardni miks'}\n` +
               `*Dodaci:* ${this.withToys ? 'Slatkiši + Igračkice/Privesci' : 'Samo slatkiši'}\n` +
               `*Cena:* ${price}`;
    if (notes) text += `\n*Slavljenik i želje:* ${notes}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  }
};