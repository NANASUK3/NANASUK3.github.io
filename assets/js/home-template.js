(function () {
  "use strict";

  var state = {
    publications: [],
    authors: {},
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
    var labels = { paper: "paper", code: "code", project: "project", demo: "demo", benchmark: "benchmark", leaderboard: "leaderboard" };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  function getTitleHTML(publication) {
    var title = escapeHTML(publication.title);
    if (publication.isPlaceholder) {
      return (
        '<span><button type="button" class="something-new-trigger" data-something-new aria-label="Explore something new">' +
        title +
        "</button></span>"
      );
    }

    var links = publication.links || {};
    var primary = safeUrl(links.project || links.paper);
    if (primary) {
      return (
        '<a href="' +
        escapeHTML(primary) +
        '" target="_blank" rel="noopener noreferrer">' +
        title +
        "</a>"
      );
    }
    return "<span>" + title + "</span>";
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
    var venue = String(publication.venue || "").trim();
    var year = publication.year ? String(publication.year) : "";
    return venue || year;
  }

  function getDescription(publication) {
    if (publication.description) return String(publication.description);
    var highlights = publication.highlights;
    if (Array.isArray(highlights)) return highlights.filter(Boolean).join(" ");
    return highlights ? String(highlights) : "";
  }

  function getImageHTML(publication) {
    if (!publication.image) return "";
    var images = [publication].concat(publication.imageAlternatives || []);
    var media = images.length > 1
      ? images[Math.floor(Math.random() * images.length)]
      : publication;
    var src = assetUrl(media.image);
    return (
      '<div class="pub-media-rotator">' +
      '<img src="' +
      escapeHTML(src) +
      '" alt="' +
      escapeHTML(media.imageAlt) +
      '"' +
      (media.imagePixelArt
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
      getTitleHTML(publication) +
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

  function renderPublications() {
    var list = document.getElementById("publications-list");
    if (!list) return;

    var all = state.publications.filter(function (publication) {
      return publication && publication.show !== false;
    });
    var empty = "No public publications yet.";
    list.innerHTML = all.length
      ? all.map(renderCoreCard).join("")
      : '<p class="research-error">' + empty + "</p>";
    document.dispatchEvent(new CustomEvent("site:publicationsrendered"));
  }

  function initNavigation() {
    var nav = document.getElementById("site-nav");
    if (!nav) return;
    var backToTop = document.querySelector("[data-back-to-top]");

    var sectionLinks = [];
    nav.querySelectorAll('.home-nav__links a[href^="#"]').forEach(function (link) {
      var section = document.getElementById(link.hash.slice(1));
      if (section) sectionLinks.push({ link: link, section: section });
    });
    var firstLink = sectionLinks[0];
    var lastLink = sectionLinks[sectionLinks.length - 1];
    var activeLink = null;

    function revealActiveLink() {
      if (!activeLink) return;
      var links = activeLink.parentElement;
      if (links.scrollWidth <= links.clientWidth) return;
      var listBounds = links.getBoundingClientRect();
      var linkBounds = activeLink.getBoundingClientRect();
      if (linkBounds.left < listBounds.left) {
        links.scrollLeft += Math.floor(linkBounds.left - listBounds.left);
      } else if (linkBounds.right > listBounds.right) {
        links.scrollLeft += Math.ceil(linkBounds.right - listBounds.right);
      }
    }

    if (firstLink && "ResizeObserver" in window) {
      new ResizeObserver(revealActiveLink).observe(firstLink.link.parentElement);
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
      revealActiveLink();
    }

    function updateActiveLink(scrollY, viewportHeight) {
      if (!firstLink) return;

      var documentHeight = document.scrollingElement.scrollHeight;
      var atBottom =
        viewportHeight > 0 && scrollY + viewportHeight >= documentHeight - 2;
      var current = firstLink;

      /* Preserve a visible anchor target when scrolling is clamped at the end
         of the page. An older hash above the reading area must not win. */
      if (atBottom && scrollY > 0) current = lastLink;
      if (atBottom && window.location.hash) {
        var hashId = window.location.hash.slice(1);
        try {
          hashId = decodeURIComponent(hashId);
        } catch (error) {}
        var hashTarget = document.getElementById(hashId);
        var hashItem = sectionLinks.find(function (item) {
          return item.section.contains(hashTarget);
        });
        if (hashItem && hashItem !== firstLink) {
          var top = hashItem.section.getBoundingClientRect().top;
          var margin =
            parseFloat(window.getComputedStyle(hashItem.section).scrollMarginTop) || 0;
          if (top >= margin - 1 && top < viewportHeight) current = hashItem;
        }
      }
      if (!atBottom && scrollY > 0) {
        var probe = Math.max(96, Math.min(viewportHeight * 0.3, 240));
        sectionLinks.forEach(function (item) {
          if (item.section.getBoundingClientRect().top <= probe) current = item;
        });
      }

      setActiveLink(current.link);
    }

    var scrollFrame = 0;
    var requestFrame =
      window.requestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 16);
      };

    function updateScrollState() {
      scrollFrame = 0;
      var scrollY = window.pageYOffset || window.scrollY || 0;
      var viewportHeight = window.innerHeight || 0;
      updateActiveLink(scrollY, viewportHeight);
      nav.classList.toggle("is-floating", scrollY > 20);
      if (backToTop)
        backToTop.classList.toggle("is-visible", scrollY > viewportHeight * 0.8);
    }

    function scheduleScrollUpdate() {
      if (!scrollFrame) scrollFrame = requestFrame(updateScrollState);
    }

    window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
    window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
    window.addEventListener("hashchange", scheduleScrollUpdate);
    updateScrollState();

    if (backToTop) {
      backToTop.addEventListener("click", function () {
        var reduced =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      });
    }
  }

  function init() {
    state.publications = parseJSONScript("publication-data", []);
    state.authors = parseJSONScript("author-links-data", {});
    renderPublications();
    initNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
