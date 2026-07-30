const GOAL_2026 = 30;
const ZODIAC_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const RATING_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const PLACEHOLDER_COVER = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#e1e0d9"/><text x="50%" y="50%" font-family="sans-serif" font-size="16" fill="#898781" text-anchor="middle" dy=".3em">No cover</text></svg>`
);

let allBooks = [];
const filters = { genre: "", trope: "", rating: "", sign: "" };
let sortKey = "dateDesc";

function fmtMonthLabel(yyyymm, lang) {
  const [y, m] = yyyymm.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const label = d.toLocaleDateString(locale, { month: "short", year: "2-digit" });
  return label.replace(".", "");
}

function attachTooltip(el, textFn) {
  const tip = document.getElementById("chart-tooltip");
  el.addEventListener("mouseenter", () => {
    tip.textContent = textFn();
    tip.classList.add("is-visible");
  });
  el.addEventListener("mousemove", (e) => {
    tip.style.left = e.clientX + "px";
    tip.style.top = e.clientY + "px";
  });
  el.addEventListener("mouseleave", () => tip.classList.remove("is-visible"));
}

function starsHtml(rating) {
  const pct = rating != null ? Math.max(0, Math.min(100, (rating / 5) * 100)) : 0;
  return `
    <span class="stars">
      <span class="stars__base">☆☆☆☆☆</span>
      <span class="stars__fill" style="width:${pct}%"><span>★★★★★</span></span>
    </span>
  `;
}

/* ---------------------------- dashboard ---------------------------- */

function renderMeter(books) {
  const lang = getLang();
  const count = books.filter((b) => b.dateRead && b.dateRead.startsWith("2026")).length;
  const pct = Math.min(100, (count / GOAL_2026) * 100);
  const el = document.getElementById("goal-meter");
  el.innerHTML = `
    <div class="meter__headline">
      <span class="meter__value">${count}</span>
      <span class="meter__goal">${t("dashboard.goal.of", { goal: GOAL_2026 })}</span>
    </div>
    <div class="meter__track"><div class="meter__fill" style="width:${pct}%"></div></div>
    <div class="meter__pct">${Math.round(pct)}%</div>
  `;
}

function renderByMonthChart(books) {
  const lang = getLang();
  const counts = {};
  books.forEach((b) => { if (b.dateRead) counts[b.dateRead] = (counts[b.dateRead] || 0) + 1; });
  const keys = Object.keys(counts).sort(); // YYYY-MM sorts chronologically ascending as strings
  const max = Math.max(1, ...Object.values(counts));

  const bars = document.getElementById("chart-bymonth");
  const labels = document.getElementById("chart-bymonth-labels");
  bars.innerHTML = "";
  labels.innerHTML = "";

  if (keys.length === 0) {
    bars.innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem;">—</span>`;
    return;
  }

  keys.forEach((key) => {
    const count = counts[key];
    const height = Math.max(6, (count / max) * 110);
    const col = document.createElement("div");
    col.className = "barchart__col";
    col.innerHTML = `
      <span class="barchart__value">${count}</span>
      <div class="barchart__bar" style="height:${height}px"></div>
    `;
    attachTooltip(col, () => `${fmtMonthLabel(key, lang)}: ${count}`);
    bars.appendChild(col);

    const lab = document.createElement("span");
    lab.className = "barchart__label";
    lab.textContent = fmtMonthLabel(key, lang);
    labels.appendChild(lab);
  });
}

function renderByRatingChart(books) {
  const counts = {};
  RATING_STEPS.forEach((r) => (counts[r] = 0));
  books.forEach((b) => { if (b.rating != null) counts[b.rating] = (counts[b.rating] || 0) + 1; });
  const max = Math.max(1, ...Object.values(counts));

  const bars = document.getElementById("chart-byrating");
  const labels = document.getElementById("chart-byrating-labels");
  bars.innerHTML = "";
  labels.innerHTML = "";

  RATING_STEPS.forEach((r) => {
    const count = counts[r];
    const height = Math.max(4, (count / max) * 110);
    const col = document.createElement("div");
    col.className = "barchart__col";
    col.innerHTML = `
      <span class="barchart__value">${count}</span>
      <div class="barchart__bar" style="height:${height}px"></div>
    `;
    attachTooltip(col, () => `${r} ★: ${count}`);
    bars.appendChild(col);

    const lab = document.createElement("span");
    lab.className = "barchart__label";
    lab.textContent = r;
    labels.appendChild(lab);
  });
}

function renderByTropeChart(books) {
  const lang = getLang();
  const counts = {};
  books.forEach((b) => {
    const trope = b.trope && b.trope[lang];
    if (trope) counts[trope] = (counts[trope] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map((e) => e[1]));

  const wrap = document.getElementById("chart-bytrope");
  wrap.innerHTML = "";

  if (entries.length === 0) {
    wrap.innerHTML = `<span style="color:var(--text-muted);font-size:0.85rem;">—</span>`;
    return;
  }

  entries.forEach(([trope, count]) => {
    const pct = (count / max) * 100;
    const row = document.createElement("div");
    row.className = "hbarchart__row";
    row.innerHTML = `
      <span class="hbarchart__label">${trope}</span>
      <div class="hbarchart__track"><div class="hbarchart__fill" style="width:${pct}%"></div></div>
      <span class="hbarchart__value">${count}</span>
    `;
    attachTooltip(row, () => `${trope}: ${count}`);
    wrap.appendChild(row);
  });
}

/* ---------------------------- filters/sort ---------------------------- */

function populateFilterOptions(books) {
  const lang = getLang();

  const genreSel = document.getElementById("filter-genre");
  const tropeSel = document.getElementById("filter-trope");
  const ratingSel = document.getElementById("filter-rating");
  const signSel = document.getElementById("filter-sign");

  const genres = [...new Set(books.map((b) => b.genre && b.genre[lang]).filter(Boolean))].sort();
  const tropes = [...new Set(books.map((b) => b.trope && b.trope[lang]).filter(Boolean))].sort();
  const ratings = [...new Set(books.map((b) => b.rating).filter((v) => v != null))].sort((a, b) => a - b);
  const signs = [...new Set(books.map((b) => b.sign).filter(Boolean))].sort(
    (a, b) => ZODIAC_ORDER.indexOf(a) - ZODIAC_ORDER.indexOf(b)
  );

  genreSel.innerHTML = `<option value="">${t("controls.all")}</option>` + genres.map((g) => `<option value="${g}">${g}</option>`).join("");
  tropeSel.innerHTML = `<option value="">${t("controls.all")}</option>` + tropes.map((tr) => `<option value="${tr}">${tr}</option>`).join("");
  ratingSel.innerHTML = `<option value="">${t("controls.all")}</option>` + ratings.map((r) => `<option value="${r}">${r} ★</option>`).join("");
  signSel.innerHTML = `<option value="">${t("controls.all")}</option>` + signs.map((s) => `<option value="${s}">${zodiacLabel(s)}</option>`).join("");
}

function getFilteredSorted(books) {
  const lang = getLang();
  let out = books.filter((b) => {
    if (filters.genre && !(b.genre && b.genre[lang] === filters.genre)) return false;
    if (filters.trope && !(b.trope && b.trope[lang] === filters.trope)) return false;
    if (filters.rating && String(b.rating) !== filters.rating) return false;
    if (filters.sign && b.sign !== filters.sign) return false;
    return true;
  });

  out.sort((a, b) => {
    switch (sortKey) {
      case "dateAsc": return (a.dateRead || "").localeCompare(b.dateRead || "");
      case "dateDesc": return (b.dateRead || "").localeCompare(a.dateRead || "");
      case "ratingDesc": return (b.rating || 0) - (a.rating || 0);
      case "ratingAsc": return (a.rating || 0) - (b.rating || 0);
      case "titleAsc": return a.title.localeCompare(b.title);
      case "yearDesc": return (b.yearReleased || 0) - (a.yearReleased || 0);
      case "yearAsc": return (a.yearReleased || 0) - (b.yearReleased || 0);
      default: return 0;
    }
  });

  return out;
}

/* ---------------------------- cards ---------------------------- */

function renderList(books) {
  const lang = getLang();
  const filtered = getFilteredSorted(books);
  const list = document.getElementById("book-list");
  const count = document.getElementById("results-count");
  count.textContent = `${filtered.length} ${lang === "pt" ? "livros" : "books"}`;

  list.innerHTML = filtered.map((b) => {
    const synopsis = (b.synopsis && b.synopsis[lang]) || "";
    const genre = (b.genre && b.genre[lang]) || "";
    const trope = (b.trope && b.trope[lang]) || "";
    const sign = zodiacLabel(b.sign);
    const cover = b.coverUrl || PLACEHOLDER_COVER;
    return `
      <article class="book-card">
        <img class="book-card__cover" src="${cover}" alt="${b.title}" loading="lazy" onerror="this.src='${PLACEHOLDER_COVER}'" />
        <div class="book-card__body">
          <h3 class="book-card__title">${b.title}</h3>
          <p class="book-card__author">${b.author}</p>
          ${synopsis ? `<p class="book-card__synopsis">${synopsis}</p>` : ""}
          <div class="book-card__meta">
            ${b.dateRead ? `<span class="tag tag--date">📅 ${b.dateRead}</span>` : ""}
            ${b.yearReleased ? `<span class="tag tag--year">${t("tag.released")} ${b.yearReleased}</span>` : ""}
            ${genre ? `<span class="tag tag--genre">${genre}</span>` : ""}
            ${trope ? `<span class="tag tag--trope">${trope}</span>` : ""}
            ${sign ? `<span class="tag tag--sign">${sign}</span>` : ""}
          </div>
          <div class="book-card__rating">
            ${starsHtml(b.rating)}
            <span class="rating-num">${b.rating != null ? b.rating.toFixed(1) + " / 5" : "—"}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ---------------------------- wiring ---------------------------- */

function renderAll(books) {
  renderMeter(books);
  renderByMonthChart(books);
  renderByRatingChart(books);
  renderByTropeChart(books);
  populateFilterOptions(books);
  renderList(books);
}

function resetFilters() {
  filters.genre = filters.trope = filters.rating = filters.sign = "";
  sortKey = "dateDesc";
  ["filter-genre", "filter-trope", "filter-rating", "filter-sign"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("sort-select").value = "dateDesc";
}

function initBooksPage() {
  fetch("data/books.json")
    .then((r) => r.json())
    .then((books) => {
      allBooks = books;
      renderAll(allBooks);

      document.getElementById("filter-genre").addEventListener("change", (e) => { filters.genre = e.target.value; renderList(allBooks); });
      document.getElementById("filter-trope").addEventListener("change", (e) => { filters.trope = e.target.value; renderList(allBooks); });
      document.getElementById("filter-rating").addEventListener("change", (e) => { filters.rating = e.target.value; renderList(allBooks); });
      document.getElementById("filter-sign").addEventListener("change", (e) => { filters.sign = e.target.value; renderList(allBooks); });
      document.getElementById("sort-select").addEventListener("change", (e) => { sortKey = e.target.value; renderList(allBooks); });
      document.getElementById("reset-filters").addEventListener("click", () => { resetFilters(); renderList(allBooks); });

      document.addEventListener("langchange", () => {
        resetFilters();
        renderAll(allBooks);
      });
    });
}

document.addEventListener("DOMContentLoaded", initBooksPage);
