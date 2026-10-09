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

    // POVEZIVANJE KLIKOVA ZA POKLONE DIREKTNO IZ JS-a (REŠAVA PROBLEM SA CENOM)
    document.getElementById('fillOptSlatkisi')?.addEventListener('click', () => {
      this.setWithToys(false);
    });

    document.getElementById('fillOptMix')?.addEventListener('click', () => {
      this.setWithToys(true);
    });

    // Validacija 1 do 4 slatkiša
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
    
    // Dodata provera postojanja elemenata pre menjanja klasa da osiguramo stabilnost
    const optSlatkisi = document.getElementById('fillOptSlatkisi');
    const optMix = document.getElementById('fillOptMix');
    
    if (optSlatkisi) optSlatkisi.classList.toggle('selected', !val);
    if (optMix) optMix.classList.toggle('selected', val);
    
    this.calculatePrice();
  },
