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
    const customSizeInput = document.getElementById('bumCustomSizeInput');

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

    // Ponovno punjenje veličina zavisno od izabranog paketa
    this.populateSizes();

    // Sakrij polje za sopstvene dimenzije ako nismo na custom opciji
    const sizeSelect = document.getElementById('bumSizeSelect');
    if (customSizeInput && sizeSelect && sizeSelect.value !== 'custom_size') {
      customSizeInput.style.display = 'none';
    }
  },

  // Prikaz polja za unos sopstvenog motiva enterijera
  toggleCustomInterior: function (val) {
    const customInput =
