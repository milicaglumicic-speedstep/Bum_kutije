import { BumBoxModule } from './bum-box.js';
import { PunchCakeModule } from './punch-cake.js';

window.bumBox = BumBoxModule;
window.punchCake = PunchCakeModule;

window.showSection = function(sectionId) {
  document.getElementById('homeScreen').style.display = (sectionId === 'homeScreen') ? 'block' : 'none';
  document.getElementById('bumView').style.display = (sectionId === 'bumView') ? 'block' : 'none';
  document.getElementById('punchView').style.display = (sectionId === 'punchView') ? 'block' : 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.sendBumViaWhatsApp = function() {
  const phone = "381644667485";
  const size = document.getElementById('bumSizeSelect').value;
  const color = document.getElementById('bumColorInput').value || 'Po dogovoru';
  const mech = document.getElementById('bumMechanismSelect').options[document.getElementById('bumMechanismSelect').selectedIndex].text;
  const price = document.getElementById('bumPriceDisplay').innerText;
  const print3D = document.getElementById('bambu3DSelect')?.value;
  const printColor = document.getElementById('bambu3DColor')?.value;
  const notes = document.getElementById('bumNotes')?.value.trim();

  let text = `Pozdrav! Šaljem upit za BUM KUTIJU 🎁\n\n` +
             `*Paket:* ${BumBoxModule.currentPackage}\n` +
             `*Veličina:* ${size}\n` +
             `*Stil stranica:* ${BumBoxModule.selectedStyle}\n` +
             `*Boja kutije:* ${color}\n` +
             `*Mehanizam:* ${mech}\n` +
             `*Cena:* ${price}`;

  if (BumBoxModule.currentPackage === 'custom_gift' && print3D) {
    text += `\n*Bambu Lab 3D Poklon:* ${print3D} (Boja: ${printColor})`;
  }
  if (notes) text += `\n*Posebne napomene / tekst:* ${notes}`;

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};

window.sendPunchViaWhatsApp = function() {
  const phone = "381644667485";
  const color = document.getElementById('punchColorInput').value || 'Po dogovoru';
  const theme = document.getElementById('punchThemeInput').value || 'Uniseks rođendanska';
  const holes = document.getElementById('punchHolesInput').value;
  const sweetsPerHole = document.getElementById('sweetsPerHoleSelect').value;
  const price = document.getElementById('punchPriceDisplay').innerText;
  const notes = document.getElementById('punchNotes').value.trim();

  let sweets = [];
  document.querySelectorAll('#punchSweetsGroup input:checked').forEach(el => sweets.push(el.value));

  let text = `Pozdrav! Šaljem upit za PUNCH ROĐENDANSKU TORTU 🎂🎈\n\n` +
             `*Tema / Motiv:* ${theme}\n` +
             `*Boja torte:* ${color}\n` +
             `*Broj pregrada:* ${holes} rupa (${PunchCakeModule.calculatedTiers} sprat/a)\n` +
             `*Slatkiša po rupi:* ${sweetsPerHole}\n` +
             `*Izabrani slatkiši (1-4):* ${sweets.join(', ')}\n` +
             `*Dodaci:* ${PunchCakeModule.withToys ? 'Slatkiši + Igračkice/Privesci' : 'Samo slatkiši'}\n` +
             `*Cena:* ${price}`;

  if (notes) text += `\n*Slavljenik i želje:* ${notes}`;

  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
};

document.addEventListener('DOMContentLoaded', () => {
  BumBoxModule.init();
  PunchCakeModule.init();
});