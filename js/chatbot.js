/* =========================================================
   Bum Kutije - Samostalni Virtuelni Asistent (Bez API ključeva)
   ========================================================= */

(function () {
  // Baza znanja sa ključnim rečima i odgovorima
  const KNOWLEDGE_BASE = [
    {
      keywords: ["pozdrav", "cao", "zdravo", "hej", "dobar dan", "pomoc"],
      response: "Ćao! Tu sam da ti pomognem oko izbora i sklapanja tvoje unikatne poklon kutije ili torte. Šta te najviše zanima?",
      actions: ["BUM Kutija opcije", "Punch Torta info", "Cene i dostava"]
    },
    {
      keywords: ["bum", "eksplodira", "iskace", "kutij", "slik"],
      response: "BUM Kutija je interaktivna eksplodirajuća kutija sa tvojim fotografijama i skrivenim porukama. Možeš izabrati osnovnu verziju ili ful paket sa iskačućim elementima i slatkišima!",
      actions: ["Pogledaj BUM kutiju", "Koliko slika staje?", "Kako se poručuje?"]
    },
    {
      keywords: ["punch", "torta", "torte", "busenje", "probu"],
      response: "Punch Torta je rođendanska interaktivna torta sa pregradama koje se buše! Ispod svakog polja nalazi se slatkiš ili malo iznenađenje.",
      actions: ["Pogledaj Punch tortu", "Vreme izrade"]
    },
    {
      keywords: ["slik", "fotografij", "slike", "rezolucij"],
      response: "Za BUM kutiju nam šalješ slike u digitalnom formatu (preko WhatsApp-a ili Vibera nakon sklapanja porudžbine). Preporučujemo jasne fotografije sa telefona za najbolji kvalitet štampe.",
      actions: ["Kako se poručuje?", "Cene i dostava"]
    },
    {
      keywords: ["cena", "cene", "koliko kosta", "placanj", "dinara"],
      response: "Cena zavisi od izabranih dodataka i dimenzija. Tačnu cenu dobijaš direktno u našem konfiguratoru na stranici kutije pre nego što potvrdiš porudžbinu!",
      actions: ["Idi na BUM konfigurator", "Poruči preko WhatsApp-a"]
    },
    {
      keywords: ["dostav", "slanj", "post", "preuzimanj", "rok", "vreme", "kad stize"],
      response: "Pakete šaljemo Post Express-om ili kurirskom službom širom Srbije. Izrada obično traje 2–4 radna dana, pa je idealno da poručiš nekoliko dana pre proslave.",
      actions: ["Kako se poručuje?"]
    },
    {
      keywords: ["poruc", "naruci", "whatsapp", "kontakt"],
      response: "Kada sklopiš svoju kutiju u konfiguratoru, klikni na dugme za poručivanje. Sistem automatski priprema poruku sa svim tvojim specifikacijama za naš WhatsApp!",
      actions: ["Otvori WhatsApp direktno"]
    }
  ];

  // Inicijalizacija stilova
  const styles = `
    .bk-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #ff477e;
      color: #fff;
      border: none;
      box-shadow: 0 4px 14px rgba(255, 71, 126, 0.4);
      cursor: pointer;
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: transform 0.2s ease;
    }
    .bk-chat-toggle:hover {
      transform: scale(1.08);
    }
    .bk-chat-window {
      position: fixed;
      bottom: 94px;
      right: 24px;
      width: 330px;
      max-width: calc(100vw - 48px);
      height: 460px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: inherit;
      border: 1px solid #f0f0f0;
      transition: all 0.25s ease-out;
    }
    .bk-chat-window.hidden {
      display: none;
    }
    .bk-chat-header {
      background: #ff477e;
      color: #fff;
      padding: 14px 16px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .bk-chat-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    .bk-chat-messages {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fafafa;
    }
    .bk-msg {
      max-width: 82%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.4;
      word-break: break-word;
    }
    .bk-msg-bot {
      background: #ffffff;
      color: #333;
      align-self: flex-start;
      border: 1px solid #eaeaea;
      border-bottom-left-radius: 3px;
    }
    .bk-msg-user {
      background: #ff477e;
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 3px;
    }
    .bk-chat-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }
    .bk-action-chip {
      background: #ffe3ec;
      color: #d81e5b;
      border: none;
      border-radius: 12px;
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
    }
    .bk-action-chip:hover {
      background: #ffd0df;
    }
    .bk-chat-input-bar {
      display: flex;
      padding: 10px;
      background: #fff;
      border-top: 1px solid #eee;
      gap: 8px;
    }
    .bk-chat-input-bar input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 13.5px;
      outline: none;
    }
    .bk-chat-input-bar button {
      background: #ff477e;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  // Ubacivanje stilova
  const styleEl = document.createElement("style");
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  // Ubacivanje HTML-a widgeta
  const widgetHtml = `
    <button class="bk-chat-toggle" id="bk-chat-toggle" data-testid="chat-toggle-btn" aria-label="Otvori ćaskanje">💬</button>
    <div class="bk-chat-window hidden" id="bk-chat-window" data-testid="chat-window">
      <div class="bk-chat-header">
        <span>🎁 Asistent za poklone</span>
        <button class="bk-chat-close" id="bk-chat-close" data-testid="chat-close-btn">&times;</button>
      </div>
      <div class="bk-chat-messages" id="bk-chat-messages" data-testid="chat-messages-container">
        <div class="bk-msg bk-msg-bot">
          Ćao! Kako mogu da ti pomognem u izboru savršenog poklona?
          <div class="bk-chat-actions">
            <button class="bk-action-chip" data-query="bum">BUM Kutija</button>
            <button class="bk-action-chip" data-query="punch">Punch Torta</button>
            <button class="bk-action-chip" data-query="dostava">Dostava i rokovi</button>
          </div>
        </div>
      </div>
      <form class="bk-chat-input-bar" id="bk-chat-form">
        <input type="text" id="bk-chat-input" data-testid="chat-input" placeholder="Postavi pitanje..." autocomplete="off" />
        <button type="submit" id="bk-chat-send" data-testid="chat-send-btn">➤</button>
      </form>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = widgetHtml;
  document.body.appendChild(container);

  // Elementi
  const toggleBtn = document.getElementById("bk-chat-toggle");
  const closeBtn = document.getElementById("bk-chat-close");
  const windowEl = document.getElementById("bk-chat-window");
  const formEl = document.getElementById("bk-chat-form");
  const inputEl = document.getElementById("bk-chat-input");
  const messagesEl = document.getElementById("bk-chat-messages");

  // Toggle vidljivosti
  toggleBtn.addEventListener("click", () => windowEl.classList.toggle("hidden"));
  closeBtn.addEventListener("click", () => windowEl.classList.add("hidden"));

  // Odgovaranje na poruke
  function appendMessage(text, isUser = false, actions = []) {
    const msg = document.createElement("div");
    msg.className = `bk-msg ${isUser ? "bk-msg-user" : "bk-msg-bot"}`;
    msg.textContent = text;

    if (!isUser && actions && actions.length > 0) {
      const actionsWrapper = document.createElement("div");
      actionsWrapper.className = "bk-chat-actions";
      actions.forEach(actionText => {
        const chip = document.createElement("button");
        chip.className = "bk-action-chip";
        chip.textContent = actionText;
        chip.addEventListener("click", () => handleUserQuery(actionText));
        actionsWrapper.appendChild(chip);
      });
      msg.appendChild(actionsWrapper);
    }

    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function handleUserQuery(query) {
    appendMessage(query, true);

    const clean = query.toLowerCase();

    // Provera akcija za preusmeravanje
    if (clean.includes("pogledaj bum") || clean.includes("idi na bum")) {
      window.location.href = "bum-kutija.html";
      return;
    }
    if (clean.includes("pogledaj punch")) {
      window.location.href = "punch-torta.html";
      return;
    }
    if (clean.includes("whatsapp")) {
      window.open("https://wa.me/?text=Zdravo!%20Zanima%20me%20izrada%20poklona.", "_blank");
      return;
    }

    // Pretraga baze znanja
    let matched = KNOWLEDGE_BASE.find(item =>
      item.keywords.some(kw => clean.includes(kw))
    );

    setTimeout(() => {
      if (matched) {
        appendMessage(matched.response, false, matched.actions);
      } else {
        appendMessage(
          "Nisam siguran za to, ali možeš pogledati naše proizvode direktno ili nam pisati na WhatsApp!",
          false,
          ["BUM Kutija", "Punch Torta", "Poruči preko WhatsApp-a"]
        );
      }
    }, 350);
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = inputEl.value.trim();
    if (!val) return;
    inputEl.value = "";
    handleUserQuery(val);
  });

  // Delegacija za početne dugmiće
  messagesEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("bk-action-chip") && e.target.dataset.query) {
      handleUserQuery(e.target.dataset.query);
    }
  });
})();
