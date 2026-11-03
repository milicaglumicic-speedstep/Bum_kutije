# Bum Kutije — Inženjerski vodič za API, mrežno testiranje i automatizaciju

Ovaj dokument predstavlja pregled naprednih scenarija testiranja za interaktivnu web aplikaciju i konfigurator **Bum Kutije**. Scenarije ne posmatramo samo kroz prizmu pisanja koda, već kroz arhitektonske odluke, ugovore o kvalitetu (SLA), otpornost na padove sistema (Resilience) i specifičnosti transakcionih sistema (POS/Payment).

---

## Pregled testnih scenarija i inženjerskih odluka

### 1. API Health Check & Performance SLA (Brza provera i performanse)

* **Arhitektonsko pitanje:** *Kako možemo najefikasnije proveriti dostupnost aplikacije i performanse u CI/CD pipeline-u bez trošenja resursa na pokretanje teških browser instanci?*
* **Inženjerski pristup:** Umesto pokretanja pravog preglednika (poput Chromium-a), test koristi čisti mrežni `APIRequestContext` koji šalje HTTP zahteve direktno ka serveru. Time se vreme izvršavanja smanjuje sa nekoliko sekundi na svega nekoliko desetina milisekundi. 
* **Zašto je ovo važno?** Pored samog statusnog koda (`200 OK`) i validacije tipa sadržaja (`Content-Type: text/html`), automatski merimo vreme odziva servera (SLA). Ako statička stranica ili bazni API odgovara sporije od definisanog praga (npr. 800ms), pipeline to detektuje u ranoj fazi (*Shift-Left* pristup), sprečavajući da sporu aplikaciju uopšte pustimo u produkciju.

### 2. Network Payload Intercept & Contract Validation (Mrežno presretanje i JSON ugovori)

* **Arhitektonsko pitanje:** *Kako možemo da garantujemo da front-end šalje ispravne podatke ka bekendu i pre nego što stvarni server ili baza podataka budu podignuti?*
* **Inženjerski pristup:** Korišćenjem mrežnog presretanja (`page.route`), klijentski zahtevi se hvataju u letu pre nego što napuste okruženje preglednika. Test čita JSON payload koji front-end šalje (`postDataJSON()`) i istovremeno vraća lažirani, ali validni odgovor servera (`route.fulfill`).
* **Zašto je ovo važno?** Ovim odvajamo testiranje front-enda od zavisnosti o eksternim servisima. Cilj nije samo proveriti da li se dugme "kliknulo", već verifikovati mrežni ugovor (*API Contract*): da li su struktura podataka, nazivi ključeva i tipovi promenljivih u potpunosti usklađeni sa onim što bekend očekuje.

### 3. Eksterna integracija i validacija URL parametara (WhatsApp API protokoli)

* **Arhitektonsko pitanje:** *Kako se testiraju funkcije koje umesto klasičnog API poziva otvaraju eksterne protokole, aplikacije trećih strana ili generišu dinamičke linkove (poput WhatsApp poruka)?*
* **Inženjerski pristup:** Umesto slanja pravih poruka, automatizacija otvara skočni prozor (`popup`), hvata generisani URL i bezbedno ga parsira pomoću standardnog `URL` objekta i njenih parametara (`searchParams.get('text')`).
* **Zašto je ovo važno?** Aplikacije često komuniciraju preko URL šema i enkodovanih stringova (gde su razmaci znakovi poput `%20` ili `+`). Korišćenjem pravilnog dekodiranja osiguravamo da se narudžbina kupca (izabrani paket, boja, dekoracija, napomene) prenosi u apsolutno čitljivom i tačnom formatu ka krajnjem kanalu prodaje. Takođe, primenom `Promise.all` rešavamo klasičan problem trke procesa (*race condition*) između klika i otvaranja novog prozora.

### 4. Financial Schema & Contract Validation (Finansijska tačnost i kalkulacije)

* **Arhitektonsko pitanje:** *Kako možemo sprečiti finansijske greške i neslaganje cena između onoga što korisnik vidi na ekranu i iznosa koji se šalje sistemu naplate?*
* **Inženjerski pristup:** Prilikom testiranja složenih konfiguratora (poput Punch Torte sa promenljivim brojem pregrada, spratova i dodataka), test simuliše obračun preko internog `PricingEngine`-a i poredi ga sa JSON podacima poslatim ka platnom servisu.
* **Zašto je ovo važno?** U e-trgovini i POS sistemima, nedopustivo je da cena na ekranu bude formatirani string sa tekstom (npr. `"7.450 RSD"`), a da sistem za naplatu očekuje čist broj (`7450`). Ovim testom radimo strogu proveru šeme (`typeof amount === 'number'`), čime eliminišemo rizik od odbijanja transakcija od strane banke ili platnog procesora.

### 5. Performance Bottleneck & Latency Simulation (Simulacija zagušenja mreže)

* **Arhitektonsko pitanje:** *Kako se ponaša naša aplikacija i korisnički interfejs ukoliko je pozadinski servis (npr. servis za popuste, lojalnost ili inventar) izuzetno spor zbog opterećenja?*
* **Inženjerski pristup:** Namernim uvođenjem veštačkog kašnjenja u mrežni odgovor (`setTimeout` unutar `route.fulfill`), simuliramo situaciju u kojoj mrežnom servisu treba duže vreme da obradi zahtev.
* **Zašto je ovo važno?** Identifikovanje uskih grla u performansama (*performance bottlenecks*) u ranoj fazi pomaže nam da osiguramo da se aplikacija ne zamrzava, da korisnik ima vizuelnu potvrdu (loading stanje) i da izbegnemo višestruko slanje istog zahteva (duple narudžbine).

### 6. Offline-First Resilience (Upravljanje prekidima internet veze u POS sistemima)

* **Arhitektonsko pitanje:** *Šta se dešava sa unetim podacima ukoliko dođe do potpunog prekida mrežne konekcije u trenutku kada korisnik ili radnik pokušava da pošalje narudžbinu?*
* **Inženjerski pristup:** Pomoću metode `route.abort('internetdisconnected')`, na nivou preglednika simuliramo potpun prekid interneta (kao da je mrežni kabl iščupan).
* **Zašto je ovo važno?** Ovo je jedan od najkritičnijih scenarija u ugostiteljstvu i POS sistemima. Čak i ako mrežni poziv prema serveru padne sa izuzetkom, aplikacija **ne sme** da obriše unete podatke iz forme. Test potvrđuje da podaci ostaju sačuvani na strani klijenta, omogućavajući osoblju da ponove slanje narudžbine onog trenutka kada se internet konekcija ponovo uspostavi.
