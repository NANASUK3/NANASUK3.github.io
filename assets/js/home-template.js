(function () {
  "use strict";

  var state = {
    publications: [],
    authors: {},
    publicationView: "core",
  };

  function getBasePath() {
    var body = document.body;
    var value = body && body.getAttribute("data-base-path");
    return value ? value.replace(/\/$/, "") : "";
  }

  function assetUrl(path) {
    if (!path) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(path) || path.charAt(0) === "/") return path;
    return getBasePath() + "/" + path.replace(/^\//, "");
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeUrl(value) {
    var url = String(value || "").trim();
    if (/^(?:https?:|mailto:)/i.test(url)) return url;
    return "";
  }

  function localized(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      var zh = document.documentElement.classList.contains("lang-zh");
      return value[zh ? "zh" : "en"] || value.en || value.zh || "";
    }
    return value == null ? "" : value;
  }

  function parseJSONScript(id, fallback) {
    var node = document.getElementById(id);
    if (!node) return fallback;
    try {
      return JSON.parse(node.textContent || node.innerText || "");
    } catch (error) {
      return fallback;
    }
  }

  function linkLabel(type) {
    var zh = document.documentElement.classList.contains("lang-zh");
    var labels = {
      paper: zh ? "论文" : "paper",
      code: zh ? "代码" : "code",
      project: zh ? "项目" : "project",
      demo: zh ? "演示" : "demo",
      benchmark: zh ? "基准" : "benchmark",
      leaderboard: zh ? "榜单" : "leaderboard",
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  function getTitleHTML(publication, className) {
    var title = localized(publication.title);
    var classAttribute = className ? ' class="' + className + '"' : "";
    if (publication.isPlaceholder) {
      return (
        "<span" +
        classAttribute +
        ">" +
        '<button type="button" class="something-new-trigger" data-something-new aria-label="Explore something new">' +
        '<span class="lang-en">' +
        escapeHTML((publication.title && publication.title.en) || title) +
        "</span>" +
        '<span class="lang-zh">' +
        escapeHTML((publication.title && publication.title.zh) || title) +
        "</span>" +
        "</button></span>"
      );
    }

    var links = publication.links || {};
    var primary = safeUrl(links.project || links.paper);
    if (primary) {
      return (
        "<a" +
        classAttribute +
        ' href="' +
        escapeHTML(primary) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHTML(title) +
        "</a>"
      );
    }
    return "<span" + classAttribute + ">" + escapeHTML(title) + "</span>";
  }

  function getAuthorsHTML(publication) {
    return (publication.authors || [])
      .map(function (author) {
        var name = escapeHTML(author.name || "");
        var href = safeUrl(state.authors[author.name]);
        if (href)
          name =
            '<a href="' +
            escapeHTML(href) +
            '" target="_blank" rel="noopener noreferrer">' +
            name +
            "</a>";
        if (author.isHighlight) name = "<u><strong>" + name + "</strong></u>";
        if (author.isCoFirst) name += "*";
        return name;
      })
      .join(", ");
  }

  function getLinkHTML(publication) {
    var links = publication.links || {};
    var items = Object.keys(links)
      .map(function (type) {
        var href = safeUrl(links[type]);
        return href ? { href: href, label: linkLabel(type) } : null;
      })
      .filter(Boolean);
    if (
      publication.misc &&
      publication.misc.text &&
      safeUrl(publication.misc.link)
    ) {
      items.push({
        href: safeUrl(publication.misc.link),
        label: publication.misc.text,
      });
    }
    items.sort(function (left, right) {
      return right.label.length - left.label.length;
    });
    return items
      .map(function (item) {
        return (
          '<a href="' +
          escapeHTML(item.href) +
          '" target="_blank" rel="noopener noreferrer">[' +
          escapeHTML(item.label) +
          "]</a>"
        );
      })
      .join("");
  }

  function getVenueText(publication) {
    var venue = String(
      localized(publication && publication.venue) || "",
    ).trim();
    var year = publication && publication.year ? String(publication.year) : "";
    return venue || year;
  }

  function getDescription(publication) {
    var description = localized(publication && publication.description);
    if (description) return String(description);
    var highlights = localized(publication && publication.highlights);
    if (Array.isArray(highlights)) return highlights.filter(Boolean).join(" ");
    return highlights ? String(highlights) : "";
  }

  function getImageHTML(publication) {
    if (!publication.image) return "";
    var src = assetUrl(publication.image);
    return (
      '<div class="pub-media-rotator" data-interval="4000">' +
      '<img src="' +
      escapeHTML(src) +
      '" alt="' +
      escapeHTML(localized(publication.imageAlt)) +
      '"' +
      (publication.imagePixelArt
        ? ' class="publication-pixel-art" width="640" height="360"'
        : "") +
      ' loading="lazy" decoding="async">' +
      "</div>"
    );
  }

  function renderCoreCard(publication) {
    var authors = getAuthorsHTML(publication);
    var description = getDescription(publication);
    var venue = getVenueText(publication);
    var links = getLinkHTML(publication);
    return (
      '<article class="publication-card">' +
      '<div class="publication-card__inner">' +
      getImageHTML(publication) +
      '<div class="publication-card__body">' +
      '<div class="publication-card__title">' +
      getTitleHTML(publication, "") +
      "</div>" +
      (authors
        ? '<p class="publication-card__authors"><i>' + authors + "</i></p>"
        : "") +
      (description
        ? '<p class="publication-card__description">' +
          escapeHTML(description) +
          "</p>"
        : "") +
      (venue || links
        ? '<p class="publication-card__meta">' +
          (venue ? "<b><i>" + escapeHTML(venue) + "</i></b>" : "") +
          (links
            ? '<span class="publication-card__links">' + links + "</span>"
            : "") +
          "</p>"
        : "") +
      "</div></div></article>"
    );
  }

  function renderFullItem(publication) {
    var venue = getVenueText(publication);
    var authors = getAuthorsHTML(publication);
    var description = getDescription(publication);
    var links = getLinkHTML(publication);
    return (
      "<li>" +
      (venue
        ? '<span class="pub-list-badge">' + escapeHTML(venue) + "</span>"
        : "") +
      '<span class="pub-list-title">' +
      getTitleHTML(publication, "") +
      "</span><br>" +
      (authors
        ? '<span class="pub-list-authors">' + authors + ".</span>"
        : "") +
      (description
        ? '<span class="pub-list-note">' + escapeHTML(description) + "</span>"
        : "") +
      (links ? '<span class="pub-list-links">' + links + "</span>" : "") +
      "</li>"
    );
  }

  function renderPublications() {
    var core = document.getElementById("core-publications");
    var full = document.getElementById("full-publications");
    if (!core || !full) return;

    var all = state.publications.filter(function (publication) {
      return publication && publication.show !== false;
    });
    var selected = all.filter(function (publication) {
      return (
        Array.isArray(publication.topics) &&
        publication.topics.indexOf("selected") !== -1
      );
    });
    if (!selected.length) selected = all;

    var empty = document.documentElement.classList.contains("lang-zh")
      ? "暂时没有公开的论文。"
      : "No public publications yet.";
    core.innerHTML = selected.length
      ? selected.map(renderCoreCard).join("")
      : '<p class="research-error">' + empty + "</p>";
    full.innerHTML = all.length
      ? '<ul class="full-publication-list">' +
        all.map(renderFullItem).join("") +
        "</ul>"
      : '<p class="research-error">' + empty + "</p>";
    setPublicationView(state.publicationView, null);
    document.dispatchEvent(new CustomEvent("site:publicationsrendered"));
  }

  function setPublicationView(value, event) {
    state.publicationView = value === "list" ? "list" : "core";
    document
      .querySelectorAll(".pub-button[data-publication-view]")
      .forEach(function (button) {
        var active =
          button.getAttribute("data-publication-view") ===
          state.publicationView;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
      });
    document
      .querySelectorAll(".publication-view[data-publication-view]")
      .forEach(function (view) {
        var active =
          view.getAttribute("data-publication-view") === state.publicationView;
        view.hidden = !active;
      });
    if (event) event.preventDefault();
  }

  function initResearch() {
    document
      .querySelectorAll(".pub-button[data-publication-view]")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          setPublicationView(
            button.getAttribute("data-publication-view"),
            null,
          );
        });
      });
    setPublicationView("core", null);
    renderPublications();
  }

  function initNavigation() {
    var nav = document.getElementById("site-nav");
    if (!nav) return;

    var sectionLinks = Array.prototype.filter
      .call(
        nav.querySelectorAll('.home-nav__links a[href^="#"]'),
        function (link) {
          return Boolean(
            document.getElementById(link.getAttribute("href").slice(1)),
          );
        },
      )
      .map(function (link) {
        return {
          link: link,
          section: document.getElementById(link.getAttribute("href").slice(1)),
        };
      });
    var activeLink = null;

    function updateFloating() {
      nav.classList.toggle(
        "is-floating",
        (window.pageYOffset || window.scrollY || 0) > 20,
      );
    }

    function setActiveLink(next) {
      if (!next || next === activeLink) return;
      if (activeLink) {
        activeLink.classList.remove("is-active");
        activeLink.removeAttribute("aria-current");
      }
      next.classList.add("is-active");
      next.setAttribute("aria-current", "location");
      activeLink = next;
    }

    function updateActiveLink() {
      if (!sectionLinks.length) return;

      var scrollY = window.pageYOffset || window.scrollY || 0;
      var viewportHeight = window.innerHeight || 0;
      var documentHeight = Math.max(
        document.documentElement.scrollHeight || 0,
        (document.body && document.body.scrollHeight) || 0,
      );
      var atBottom =
        viewportHeight > 0 && scrollY + viewportHeight >= documentHeight - 2;
      var probe = scrollY + Math.max(96, Math.min(viewportHeight * 0.3, 240));
      var current = null;

      sectionLinks.forEach(function (item) {
        var top = item.section.getBoundingClientRect().top + scrollY;
        if (top <= probe) current = item;
      });

      /* On a short page the browser cannot place a lower heading at the
         requested top offset. Keep a non-top hash target active at the bottom
         so clicking Awards or Experiences still gives visible feedback. */
      if (atBottom && window.location.hash) {
        var hashId = window.location.hash.slice(1);
        try {
          hashId = decodeURIComponent(hashId);
        } catch (error) {}
        var legacyHashTargets = {
          news: "News",
          experience: "Experiences",
          publications: "Research",
          awards: "Awards",
        };
        var hashTargetId = legacyHashTargets[hashId.toLowerCase()] || hashId;
        var hashItem = sectionLinks.filter(function (item) {
          return (
            item.section.id.toLowerCase() === hashTargetId.toLowerCase() &&
            item.link.offsetParent !== null
          );
        })[0];
        if (hashItem && hashItem !== sectionLinks[0]) current = hashItem;
      }

      /* Keep About highlighted before the first section edge enters the
         reading cursor, including on short viewports and restored hashes. */
      setActiveLink((current || sectionLinks[0]).link);
    }

    var scrollFrame = 0;
    window.addEventListener(
      "scroll",
      function () {
        if (scrollFrame) return;
        var requestFrame =
          window.requestAnimationFrame ||
          function (callback) {
            return window.setTimeout(callback, 16);
          };
        scrollFrame = requestFrame(function () {
          scrollFrame = 0;
          updateFloating();
          updateActiveLink();
        });
      },
      { passive: true },
    );
    window.addEventListener("resize", updateActiveLink, { passive: true });
    window.addEventListener("hashchange", updateActiveLink, { passive: true });
    updateFloating();
    updateActiveLink();

    nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        var reduced =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var currentScroll = window.pageYOffset || window.scrollY || 0;
        window.scrollTo({
          top: Math.max(
            0,
            target.getBoundingClientRect().top +
              currentScroll -
              (window.innerWidth <= 600 ? 76 : 40),
          ),
          behavior: reduced ? "auto" : "smooth",
        });
        setActiveLink(link);
        window.history.pushState(null, "", link.getAttribute("href"));
      });
    });
  }

  function syncLanguage() {
    var zh = document.documentElement.classList.contains("lang-zh");
    document.documentElement.setAttribute("lang", zh ? "zh-CN" : "en");
    renderPublications();
  }

  function init() {
    state.publications = parseJSONScript("publication-data", []);
    state.authors = parseJSONScript("author-links-data", {});
    initNavigation();
    initResearch();
    syncLanguage();
    document.addEventListener("site:layoutchange", syncLanguage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
