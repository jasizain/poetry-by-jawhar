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

// ---- Hero: rotate through the looks every few seconds ----
const HERO_INTERVAL = 3000;

function initHeroRotation() {
  const ba = $("[data-hero-ba]");
  const caption = $("[data-hero-caption]");
  const first = $(".ba-layer", ba);
  const handle = $(".ba-handle", ba);

  // The first look is already in the HTML; add the rest as hidden layers
  const layers = [first, ...LOOKS.slice(1).map((l) => {
    const layer = document.createElement("div");
    layer.className = "ba-layer";
    layer.innerHTML = `
      <img class="ba-after" src="images/${l.id}-after.jpg" alt="${l.title}, edited with the ${PACK.name}" width="1000" height="1500">
      <img class="ba-before" src="images/${l.id}-before.jpg" alt="" aria-hidden="true" width="1000" height="1500">`;
    first.parentNode.insertBefore(layer, $(".ba-tag", ba));
    return layer;
  })];

  let index = 0;
  let paused = false;

  const show = (i) => {
    layers[index].classList.remove("is-active");
    index = i;
    layers[index].classList.add("is-active");
    caption.style.opacity = 0;
    setTimeout(() => { caption.textContent = LOOKS[index].title; caption.style.opacity = 1; }, 200);
  };

  // Don't switch photos while someone is comparing
  ba.addEventListener("pointerenter", () => { paused = true; });
  ba.addEventListener("pointerleave", () => { paused = false; });
  ba.addEventListener("pointerdown", () => { paused = true; });
  ba.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") paused = false; });
  handle.addEventListener("focus", () => { paused = true; });
  handle.addEventListener("blur", () => { paused = false; });

  setInterval(() => {
    if (!paused && !document.hidden) show((index + 1) % layers.length);
  }, HERO_INTERVAL);
}

// ---- Init ----
renderLooks();
initHeroRotation();
$$("[data-ba]").forEach(initSlider);
$$("[data-price]").forEach((el) => { el.textContent = money(PACK.price); });
$$("[data-buy]").forEach((a) => { a.href = buyUrl(); });
$("[data-year]").textContent = new Date().getFullYear();
