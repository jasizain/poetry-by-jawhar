// ---- Store settings: edit price, pack name and contact here ----
const WHATSAPP_NUMBER = "919645705564";
const PACK = { name: "Poetry Preset Pack", price: 2499 };
const CURRENCY = "₹";

// Example photos shown in the "Looks" grid (images/<id>-before.jpg and -after.jpg)
const LOOKS = [
  { id: "ivory-gold", title: "Golden ceremony", desc: "Silk, temple gold and soft daylight. Warm, with natural skin tones." },
  { id: "riverside-film", title: "Riverside haze", desc: "Soft and filmic for hazy outdoor light." },
  { id: "monochrome-poem", title: "Black & white", desc: "Deep contrast and fine grain for emotional portraits." },
  { id: "forest-moody", title: "Forest greens", desc: "Rich greens and reds in shaded, leafy places." },
  { id: "blush-heirloom", title: "Pastel reception", desc: "Clean whites and gentle blush on ivory outfits." },
];

// ---- Helpers ----
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = (n) => CURRENCY + n.toLocaleString("en-IN");

const buyUrl = () => {
  const msg = `Hi Jawhar! I'd like to buy the ${PACK.name} (${money(PACK.price)}). Please share the payment details.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
};

// ---- Render looks + pack tile ----
function renderLooks() {
  $("[data-looks]").innerHTML = LOOKS.map((l) => `
    <article class="card">
      <div class="ba" data-ba>
        <img class="ba-after" src="images/${l.id}-after.jpg" alt="${l.title}, edited with the ${PACK.name}" loading="lazy" width="1000" height="1500">
        <img class="ba-before" src="images/${l.id}-before.jpg" alt="" aria-hidden="true" loading="lazy" width="1000" height="1500">
        <span class="ba-tag ba-tag-before">Before</span>
        <span class="ba-tag ba-tag-after">After</span>
        <span class="ba-handle" role="slider" tabindex="0" aria-label="${l.title} before and after" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></span>
      </div>
      <div class="card-body">
        <h3>${l.title}</h3>
        <p class="card-desc">${l.desc}</p>
      </div>
    </article>`).join("") + `
    <div class="pack-tile">
      <blockquote class="pack-tile-quote">
        <p>“Every frame deserves<br>to feel like a <em>poem.</em>”</p>
        <cite>— poetry by jawhar</cite>
      </blockquote>
      <div class="pack-tile-main">
        <p class="pack-tile-kicker">The ${PACK.name}</p>
        <h3>Every look above, <em>in one pack.</em></h3>
        <span class="pack-tile-rule" aria-hidden="true"></span>
        <span class="price" data-price></span>
        <p class="pack-tile-note">Mobile + Desktop · Install guide · WhatsApp help</p>
        <a class="btn btn-ghost" href="https://wa.me/${WHATSAPP_NUMBER}" data-buy target="_blank" rel="noopener">Buy now</a>
      </div>
    </div>`;
}

// ---- Before / after slider ----
function initSlider(el) {
  const handle = $(".ba-handle", el);
  const tags = $$(".ba-tag", el);
  let pos = 50;
  let dragging = false;

  const set = (v) => {
    pos = Math.max(0, Math.min(100, v));
    el.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", Math.round(pos));
    tags[0].style.opacity = pos < 12 ? 0 : 1;
    tags[1].style.opacity = pos > 88 ? 0 : 1;
  };
  const fromEvent = (e) => {
    const r = el.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };

  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  el.addEventListener("pointermove", (e) => { if (dragging) fromEvent(e); });
  const stop = () => { dragging = false; };
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointercancel", stop);

  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") { set(pos - step); e.preventDefault(); }
    if (e.key === "ArrowRight") { set(pos + step); e.preventDefault(); }
    if (e.key === "Home") { set(0); e.preventDefault(); }
    if (e.key === "End") { set(100); e.preventDefault(); }
  });

  set(50);
}

// ---- Hero: deck of colour edits; a new photo rises to the front every few seconds ----
const HERO_INTERVAL = 3000;

function initHeroDeck() {
  const deck = $("[data-hero-deck]");
  if (!deck) return;
  const caption = $("[data-hero-caption]");
  const count = $("[data-hero-count]");
  const looks = LOOKS.filter((l) => l.id !== "monochrome-poem"); // colour photos only

  // The first photo is already in the HTML; add the rest behind it
  const cards = [$("img", deck), ...looks.slice(1).map((l) => {
    const img = document.createElement("img");
    img.src = `images/${l.id}-after.jpg`;
    img.alt = `${l.title}, edited with the ${PACK.name}`;
    img.width = 1000; img.height = 1500;
    deck.appendChild(img);
    return img;
  })];
  cards.forEach((c, i) => { c.dataset.look = i; });

  // order[0] is the front card; the rest step back (positions above 3 stay hidden)
  let order = [...cards];
  const place = () => order.forEach((c, i) => { c.dataset.pos = Math.min(i, 3); });
  place();

  const label = (i) => {
    caption.style.opacity = 0;
    setTimeout(() => {
      caption.textContent = looks[i].title;
      count.textContent = String(i + 1).padStart(2, "0");
      caption.style.opacity = 1;
    }, 250);
  };

  let paused = false;
  deck.addEventListener("pointerenter", () => { paused = true; });
  deck.addEventListener("pointerleave", () => { paused = false; });

  setInterval(() => {
    if (paused || document.hidden) return;
    const next = order.pop();          // the card furthest back comes to the front
    next.dataset.pos = "enter";        // jump below the deck without animating
    void next.offsetWidth;
    order.unshift(next);
    place();
    label(Number(next.dataset.look));
  }, HERO_INTERVAL);
}

// ---- Init ----
renderLooks();
initHeroDeck();
$$("[data-ba]").forEach(initSlider);
$$("[data-price]").forEach((el) => { el.textContent = money(PACK.price); });
$$("[data-buy]").forEach((a) => { a.href = buyUrl(); });
$("[data-year]").textContent = new Date().getFullYear();
