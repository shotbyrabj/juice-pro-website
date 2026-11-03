"use strict";

/* ===== EDIT THESE ===== */
const CONFIG = {
  brand: "The Juice Pro",
  instagram: "juice_by_thejuicepro",
  phone: "+233 00 000 0000",   // display format
  whatsapp: "233000000000",    // digits only, country code first, no +
  currency: "GH₵"
};

/* Prices: single, pack of 4, pack of 6. Replace names, ingredients and prices with your real menu. */
const PRODUCTS = [
  { id: "sunrise",  name: "Sunrise",  emoji: "🍊", color: "#ff9a3c", mix: "Orange, pineapple, ginger",   prices: [15, 55, 80] },
  { id: "green",    name: "Green Glow", emoji: "🥬", color: "#c6ef4b", mix: "Cucumber, apple, celery, lime", prices: [15, 55, 80] },
  { id: "beet",     name: "Beet Boost", emoji: "🍎", color: "#e0457b", mix: "Beetroot, apple, carrot, lemon", prices: [15, 55, 80] },
  { id: "tropical", name: "Tropical Rush", emoji: "🥭", color: "#ffd25e", mix: "Mango, pineapple, passion fruit", prices: [15, 55, 80] },
  { id: "watermelon", name: "Melon Chill", emoji: "🍉", color: "#ff6b6b", mix: "Watermelon, mint, lime", prices: [15, 55, 80] },
  { id: "zing",     name: "Ginger Zing", emoji: "🫚", color: "#f4b942", mix: "Ginger, lemon, pineapple, turmeric", prices: [15, 55, 80] }
];
const SIZES = ["Single", "Pack of 4", "Pack of 6"];

/* ===== helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const money = n => `${CONFIG.currency}${n}`;
let cart = [];
try { cart = JSON.parse(localStorage.getItem("jjp-cart")) || []; } catch (e) { cart = []; }
const save = () => { try { localStorage.setItem("jjp-cart", JSON.stringify(cart)); } catch (e) {} };

/* ===== header and footer ===== */
const links = [["index.html","Home","home"],["products.html","Products","products"],["cocktails.html","Cocktails","cocktails"],["about.html","About","about"],["contact.html","Contact","contact"]];
const page = document.body.dataset.page;
$("#site-header").innerHTML = `
<header class="top"><div class="wrap">
  <a class="logo" href="index.html">${CONFIG.brand}</a>
  <nav><ul class="nav" id="nav">${links.map(([h,t,k]) => `<li><a href="${h}" ${k===page?'aria-current="page"':""}>${t}</a></li>`).join("")}</ul></nav>
  <div class="row" style="align-items:center">
    <button class="cart-btn" id="open-cart" aria-label="Open basket">Basket (<span id="count">0</span>)</button>
    <button class="menu-btn" id="menu" aria-label="Menu" aria-expanded="false">☰</button>
  </div>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Basket">
  <header><h2>Your basket</h2><button class="close" id="close-cart" aria-label="Close basket">×</button></header>
  <ul id="cart-items"></ul>
  <footer><div class="total"><span>Total</span><span id="total"></span></div>
  <a class="btn" id="checkout" href="#" target="_blank" rel="noopener">Send order on WhatsApp</a></footer>
</aside>`;
$("#site-footer").innerHTML = `
<footer class="foot"><div class="wrap">
  <div><strong>${CONFIG.brand}</strong><br>Fresh juice for every occasion</div>
  <div><a href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">@${CONFIG.instagram}</a><br>${CONFIG.phone}</div>
</div></footer>`;

$("#menu").onclick = e => { const o = $("#nav").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); };

/* ===== products page ===== */
const grid = $("#product-grid");
if (grid) {
  grid.innerHTML = PRODUCTS.map(p => `
  <article class="p" data-id="${p.id}">
    <div class="swatch" style="background:${p.color}" aria-hidden="true">${p.emoji}</div>
    <div class="p-body">
      <h3>${p.name}</h3>
      <p class="tags">${p.mix}</p>
      <div class="sizes" role="radiogroup" aria-label="Size for ${p.name}">
        ${SIZES.map((s,i) => `<label><input type="radio" name="size-${p.id}" value="${i}" ${i===0?"checked":""}><span>${s}<br><b>${money(p.prices[i])}</b></span></label>`).join("")}
      </div>
      <button class="btn add">Add to basket</button>
    </div>
  </article>`).join("");
  grid.addEventListener("click", e => {
    if (!e.target.classList.contains("add")) return;
    const card = e.target.closest(".p"), p = PRODUCTS.find(x => x.id === card.dataset.id);
    const i = +card.querySelector("input:checked").value;
    addItem(`${p.id}-${i}`, `${p.name} (${SIZES[i]})`, p.prices[i]);
  });
}

/* ===== cart ===== */
function addItem(key, name, price) {
  const it = cart.find(c => c.key === key);
  it ? it.qty++ : cart.push({ key, name, price, qty: 1 });
  save(); render(); toast(`${name} added`);
}
function render() {
  $("#count").textContent = cart.reduce((a, c) => a + c.qty, 0);
  const total = cart.reduce((a, c) => a + c.qty * c.price, 0);
  $("#total").textContent = money(total);
  $("#cart-items").innerHTML = cart.length ? cart.map(c => `
    <li><span>${c.name}<br><small>${money(c.price)} each</small></span>
    <span class="qty"><button data-k="${c.key}" data-d="-1" aria-label="Remove one">−</button> ${c.qty} <button data-k="${c.key}" data-d="1" aria-label="Add one">+</button></span></li>`).join("")
    : `<li class="empty">Your basket is empty. Add a juice to get started.</li>`;
  const msg = cart.length
    ? `Hi, I would like to order:\n${cart.map(c => `- ${c.qty} x ${c.name}`).join("\n")}\nTotal: ${money(total)}\n\nName:\nDelivery location:\nDate and time:`
    : "Hi, I would like to order juice.";
  $("#checkout").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}
$("#cart-items").addEventListener("click", e => {
  const b = e.target.closest("button[data-k]"); if (!b) return;
  const it = cart.find(c => c.key === b.dataset.k); it.qty += +b.dataset.d;
  cart = cart.filter(c => c.qty > 0); save(); render();
});
const toggle = open => { $("#drawer").classList.toggle("open", open); $("#scrim").classList.toggle("open", open); };
$("#open-cart").onclick = () => toggle(true);
$("#close-cart").onclick = $("#scrim").onclick = () => toggle(false);
document.addEventListener("keydown", e => e.key === "Escape" && toggle(false));

function toast(t) {
  const el = Object.assign(document.createElement("div"), { className: "toast", textContent: t, role: "status" });
  document.body.append(el); setTimeout(() => el.remove(), 1800);
}

/* ===== contact page ===== */
document.querySelectorAll("[data-phone]").forEach(el => el.textContent = CONFIG.phone);
document.querySelectorAll("[data-wa]").forEach(el => el.href = `https://wa.me/${CONFIG.whatsapp}`);
document.querySelectorAll("[data-tel]").forEach(el => el.href = `tel:${CONFIG.whatsapp ? "+" + CONFIG.whatsapp : ""}`);

render();
