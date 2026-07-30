// Minimal i18n: EN / PT-BR toggle, persisted in localStorage, no build step.
const I18N = {
  en: {
    "brand": "📚 My Bookshelf",
    "nav.books": "Books",
    "nav.authors": "Authors",
    "nav.about": "About Me",

    "books.title": "Books",
    "books.subtitle": "Every book I've read, tracked one card at a time.",

    "authors.title": "Authors",
    "about.title": "About Me",
    "empty.comingSoon": "This page is coming soon.",

    "dashboard.goal.title": "2026 Reading Goal",
    "dashboard.goal.of": "of {goal} books",
    "dashboard.bymonth.title": "Books by Month",
    "dashboard.byrating.title": "Books by Rating",
    "dashboard.bytrope.title": "Books by Trope",

    "controls.genre": "Genre",
    "controls.trope": "Trope",
    "controls.rating": "Rating",
    "controls.sign": "Sign",
    "controls.sort": "Sort by",
    "controls.all": "All",
    "controls.reset": "Reset filters",
    "controls.search.placeholder": "Search title or author…",

    "sort.dateDesc": "Date read (newest)",
    "sort.dateAsc": "Date read (oldest)",
    "sort.ratingDesc": "Rating (highest)",
    "sort.ratingAsc": "Rating (lowest)",
    "sort.titleAsc": "Title (A–Z)",
    "sort.yearDesc": "Year released (newest)",
    "sort.yearAsc": "Year released (oldest)",

    "tag.released": "Released",

    "footer": "Built with ♥ for tracking books.",

    "zodiac.aries": "Aries",
    "zodiac.taurus": "Taurus",
    "zodiac.gemini": "Gemini",
    "zodiac.cancer": "Cancer",
    "zodiac.leo": "Leo",
    "zodiac.virgo": "Virgo",
    "zodiac.libra": "Libra",
    "zodiac.scorpio": "Scorpio",
    "zodiac.sagittarius": "Sagittarius",
    "zodiac.capricorn": "Capricorn",
    "zodiac.aquarius": "Aquarius",
    "zodiac.pisces": "Pisces"
  },
  pt: {
    "brand": "📚 Minha Estante",
    "nav.books": "Livros",
    "nav.authors": "Autoras",
    "nav.about": "Sobre Mim",

    "books.title": "Livros",
    "books.subtitle": "Todos os livros que já li, um card de cada vez.",

    "authors.title": "Autoras",
    "about.title": "Sobre Mim",
    "empty.comingSoon": "Esta página está em construção.",

    "dashboard.goal.title": "Meta de Leitura 2026",
    "dashboard.goal.of": "de {goal} livros",
    "dashboard.bymonth.title": "Livros por Mês",
    "dashboard.byrating.title": "Livros por Nota",
    "dashboard.bytrope.title": "Livros por Trope",

    "controls.genre": "Gênero",
    "controls.trope": "Trope",
    "controls.rating": "Nota",
    "controls.sign": "Signo",
    "controls.sort": "Ordenar por",
    "controls.all": "Todos",
    "controls.reset": "Limpar filtros",
    "controls.search.placeholder": "Buscar título ou autora…",

    "sort.dateDesc": "Data de leitura (mais recente)",
    "sort.dateAsc": "Data de leitura (mais antiga)",
    "sort.ratingDesc": "Nota (maior)",
    "sort.ratingAsc": "Nota (menor)",
    "sort.titleAsc": "Título (A–Z)",
    "sort.yearDesc": "Ano de lançamento (mais recente)",
    "sort.yearAsc": "Ano de lançamento (mais antigo)",

    "tag.released": "Lançamento",

    "footer": "Feito com ♥ para acompanhar leituras.",

    "zodiac.aries": "Áries",
    "zodiac.taurus": "Touro",
    "zodiac.gemini": "Gêmeos",
    "zodiac.cancer": "Câncer",
    "zodiac.leo": "Leão",
    "zodiac.virgo": "Virgem",
    "zodiac.libra": "Libra",
    "zodiac.scorpio": "Escorpião",
    "zodiac.sagittarius": "Sagitário",
    "zodiac.capricorn": "Capricórnio",
    "zodiac.aquarius": "Aquário",
    "zodiac.pisces": "Peixes"
  }
};

const ZODIAC_SYMBOL = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
};

function getLang() {
  return localStorage.getItem("lang") || (navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en");
}

function t(key, vars) {
  const lang = getLang();
  let str = (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
  if (vars) {
    Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
  }
  return str;
}

function zodiacLabel(signKey) {
  if (!signKey) return "";
  const symbol = ZODIAC_SYMBOL[signKey] || "";
  return `${symbol} ${t("zodiac." + signKey)}`.trim();
}

function applyLang(lang) {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  applyLang(lang);
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

function initI18n() {
  applyLang(getLang());
  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
}

document.addEventListener("DOMContentLoaded", initI18n);
