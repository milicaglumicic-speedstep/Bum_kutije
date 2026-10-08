const explodingGiftTemplate = `
  <div class="gift-scene">
    <div class="exploding-box">
      <div class="box-lid">
        <svg class="lid-bow" viewBox="0 0 60 42" fill="none">
          <path d="M30 18 C18 6, 4 8, 7 20 C10 27, 22 22, 30 18 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
          <path d="M26 18 C18 10, 8 11, 10 19 C12 23, 20 20, 26 18 Z" fill="#fef08a" opacity="0.6"/>
          <path d="M30 18 C42 6, 56 8, 53 20 C50 27, 38 22, 30 18 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
          <path d="M34 18 C42 10, 52 11, 50 19 C48 23, 40 20, 34 18 Z" fill="#fef08a" opacity="0.6"/>
          <path d="M27 21 Q18 30 12 38 L19 36 Q25 29 28 22 Z" fill="#f59e0b"/>
          <path d="M33 21 Q42 30 48 38 L41 36 Q35 29 32 22 Z" fill="#f59e0b"/>
          <ellipse cx="30" cy="19" rx="5" ry="4" fill="#fde047" stroke="#b45309" stroke-width="1.2"/>
        </svg>
      </div>
      <div class="box-base"></div>
      <div class="box-wall wall-front"></div>
      <div class="box-wall wall-back"></div>
      <div class="box-wall wall-left"></div>
      <div class="box-wall wall-right"></div>
      <div class="box-pop-burst">
        <div class="mini-cube"></div>
        <div class="spark c-gold"></div>
        <div class="spark c-blue"></div>
        <div class="spark c-pink"></div>
        <div class="spark c-green"></div>
      </div>
    </div>
  </div>
`;

const animatedCakeTemplate = `
  <div class="cake-animated-box">
    <div class="candles-row">
      <div class="cake-candle"><div class="cake-flame"></div></div>
      <div class="cake-candle"><div class="cake-flame"></div></div>
      <div class="cake-candle"><div class="cake-flame"></div></div>
    </div>
    <div class="cake-tier-top-neutral"></div>
    <div class="cake-tier-bottom-neutral"></div>
  </div>
`;

function renderHomeScreen() {
  const root = document.getElementById('appRoot');
  if (!root) return;
  root.innerHTML = `
    <div id="homeScreen">
      <h1 class="main-title">KREATIVNA RADIONICA POKLONA</h1>
      <p class="main-subtitle">Izaberi šta želiš da prilagodiš i poručiš:</p>

      <div class="hub-grid">
        <div class="hub-card bum" id="btnGoBum">
          ${explodingGiftTemplate}
          <h2>BUM KUTIJA</h2>
          <p class="hub-card-desc">Interaktivna eksplodirajuća poklon kutija ili ful paket</p>
          <div class="hub-btn">Sklopi svoju BUM poklon kutiju →</div>
        </div>

        <div class="hub-card punch" id="btnGoPunch">
          ${animatedCakeTemplate}
          <h2>PUNCH TORTA</h2>
          <p class="hub-card-desc">Rođendanska interaktivna torta sa slatkišima i iznenađenjem</p>
          <div class="hub-btn">Kreiraj Punch tortu →</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btnGoBum')?.addEventListener('click', () => window.showSection('bumView'));
  document.getElementById('btnGoPunch')?.addEventListener('click', () => window.showSection('punchView'));
}

window.showSection = function(sectionId) {
  const root = document.getElementById('appRoot');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (sectionId === 'homeScreen') {
    renderHomeScreen();
  } else if (sectionId === 'bumView' && window.bumBox) {
    window.bumBox.mount(root);
  } else if (sectionId === 'punchView' && window.punchCake) {
    window.punchCake.mount(root);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderHomeScreen();
});