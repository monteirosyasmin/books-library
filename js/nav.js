// Shared nav + footer, injected into every page to avoid markup duplication.
(function () {
  const page = document.body.dataset.page;

  const navHtml = `
    <nav class="site-nav">
      <span class="site-nav__brand" data-i18n="brand"></span>
      <div class="site-nav__links">
        <a href="index.html" data-i18n="nav.books" class="${page === "books" ? "is-active" : ""}"></a>
        <a href="authors.html" data-i18n="nav.authors" class="${page === "authors" ? "is-active" : ""}"></a>
        <a href="about.html" data-i18n="nav.about" class="${page === "about" ? "is-active" : ""}"></a>
      </div>
      <div class="lang-toggle">
        <button type="button" data-lang="en">EN</button>
        <button type="button" data-lang="pt">PT-BR</button>
      </div>
    </nav>
  `;

  const footerHtml = `
    <footer class="site-footer">
      <span data-i18n="footer"></span>
    </footer>
  `;

  document.getElementById("nav-placeholder").innerHTML = navHtml;
  document.getElementById("footer-placeholder").innerHTML = footerHtml;
})();
