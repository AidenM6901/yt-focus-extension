/**
 * YouTube Focus Mode - focus.js v1.1
 */

(function () {
  "use strict";

  const DEFAULTS = {
    blockShorts: true,
    hideRecommendations: true,
    hideBreakingNews: true,
    hidePremium: true,
    hideEndscreen: false,
    hideExploreSection: true,
    hideSidebarLinks: true,
    disableHomepage: true,
    hideHomeEntry: true,
    hideShortsEntry: true,
    hideRecommendedVideos: false,
    hideMostRelevant: false,
    hideAskAi: false,
    redirectLogo: true,
    padComments: false,
    showTimer: false,
  };

  let settings = { ...DEFAULTS };

  function loadSettings(cb) {
    try {
      chrome.storage.sync.get(DEFAULTS, (stored) => {
        settings = { ...DEFAULTS, ...stored };
        cb(settings);
      });
    } catch { cb(settings); }
  }

  function applyClasses() {
    const html = document.documentElement;
    html.classList.toggle("ytd-focus-hide-endscreen", !!settings.hideEndscreen);
    html.classList.toggle("ytfm-hide-secondary", !!settings.hideRecommendations);
    html.classList.toggle("ytfm-hide-ask-ai", !!settings.hideAskAi);
    html.classList.toggle("ytfm-hide-recs", !!settings.hideRecommendedVideos);
    html.classList.toggle("ytfm-pad-comments", !!settings.padComments);
    html.classList.toggle("ytfm-hide-most-relevant", !!settings.hideMostRelevant);
    // Align "Latest" with sidebar top only when Most Relevant is visible —
    // that shelf adds height above, so the alignment looks correct with it there.
    html.classList.toggle("ytfm-align-subs-top", !settings.hideMostRelevant);
  }

  // ─── Shorts redirect guard ────────────────────────────────────────────────
  function checkShortsRedirect() {
    if (!settings.blockShorts) return;
    const shortsMatch = location.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      const params = new URLSearchParams(location.search);
      params.set("v", shortsMatch[1]);
      history.replaceState(null, "", "/watch?" + params.toString());
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    }
  }

  // ─── Homepage → Subscriptions redirect ───────────────────────────────────
  function checkHomeRedirect() {
    if (!settings.disableHomepage) return;
    if (location.pathname === "/" || location.pathname === "/feed/trending") {
      history.replaceState(null, "", "/feed/subscriptions");
      window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
    }
  }

  // ─── Element hider ───────────────────────────────────────────────────────
  const SHELF_SELECTORS = [
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-masthead-ad-v4-renderer",
    "ytd-masthead-ad-v3-renderer",
    "ytd-banner-promo-renderer",
    "ytd-survey-panel-renderer",
    "yt-survey-renderer",
    "ytd-premium-yva-upsell-renderer",
    "ytd-mealbar-promo-renderer",
    "yt-mealbar-promo-renderer",
    "ytd-primetime-promo-renderer",
    "ytd-statement-banner-renderer",
    "ytd-ypc-shelf-renderer",
    "ytd-ypc-trailer-renderer",
    "ytd-sponsors-shelf-renderer",
    "ytd-enforcement-message-view-model",
  ];

  function hideElement(el) {
    if (el && el.style) el.style.setProperty("display", "none", "important");
  }

  function nodeContainsShortsLink(node) {
    try { return !!node.querySelector('a[href*="/shorts/"]'); } catch { return false; }
  }

  function nodeIsShortsCard(node) {
    const tag = node.tagName && node.tagName.toLowerCase();
    return (
      tag === "ytd-rich-item-renderer" ||
      tag === "ytd-grid-video-renderer" ||
      tag === "ytd-video-renderer"
    ) && nodeContainsShortsLink(node);
  }

  function isNewsShelf(node) {
    if (!node.matches) return false;
    if (!node.matches("ytd-rich-shelf-renderer, ytd-shelf-renderer, ytd-rich-section-renderer")) return false;
    return /breaking news|top news|latest news/i.test(node.innerText || "");
  }

  const PREMIUM_SELECTORS = [
    "ytd-mealbar-promo-renderer", "yt-mealbar-promo-renderer",
    "ytd-primetime-promo-renderer", "ytd-statement-banner-renderer",
    "ytd-ypc-shelf-renderer", "ytd-ypc-trailer-renderer",
    "ytd-premium-yva-upsell-renderer", "ytd-sponsors-shelf-renderer",
    "ytd-enforcement-message-view-model",
  ];

  function isPremiumNode(node) {
    if (!node.matches) return false;
    if (PREMIUM_SELECTORS.some((s) => node.matches(s))) return true;
    if (node.matches("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer")) {
      return !!node.querySelector('a[href*="/premium"]');
    }
    return false;
  }

  function processNode(node) {
    if (node.nodeType !== 1) return;

    if (settings.blockShorts) {
      if (node.matches && node.matches("ytd-reel-shelf-renderer")) { hideElement(node); return; }
      if (node.tagName && node.tagName.toLowerCase() === "ytd-rich-shelf-renderer") {
        if (node.hasAttribute("is-shorts") || nodeContainsShortsLink(node)) { hideElement(node); return; }
      }
      if (nodeIsShortsCard(node)) { hideElement(node); return; }
    }

    if (settings.hideBreakingNews && isNewsShelf(node)) { hideElement(node); return; }
    if (settings.hidePremium && isPremiumNode(node)) { hideElement(node); return; }

    SHELF_SELECTORS.forEach((sel) => {
      if (node.matches && node.matches(sel)) hideElement(node);
    });

    if (node.children && node.children.length) {
      Array.from(node.children).forEach(processNode);
    }
  }

  // ─── Sidebar guide section text-based hiding ──────────────────────────────
  const EXPLORE_SECTION_TITLES = new Set([
    "trending", "music", "movies & tv", "live", "gaming",
    "news", "sports", "learning", "fashion & beauty", "podcasts", "courses",
  ]);

  const MORE_SECTION_TITLES = new Set([
    "youtube premium", "youtube music", "youtube kids", "youtube tv",
  ]);

  function getEntryTitle(entryEl) {
    const fs = entryEl.querySelector("yt-formatted-string.title");
    return fs ? fs.textContent.trim().toLowerCase() : "";
  }

  function sweepGuideSections() {
    document.querySelectorAll("ytd-guide-section-renderer").forEach((section) => {
      const entries = Array.from(section.querySelectorAll("ytd-guide-entry-renderer"));
      const titles = entries.map(getEntryTitle);

      const isExplore = titles.some((t) => EXPLORE_SECTION_TITLES.has(t));
      const isMore = titles.some((t) => MORE_SECTION_TITLES.has(t));

      // Hide/show whole Explore or More sections based on settings
      if ((isExplore && settings.hideExploreSection) || (isMore && settings.hideSidebarLinks)) {
        section.classList.add("ytfm-hidden");
        return; // Skip per-entry logic for explicitly hidden sections
      } else if (isExplore || isMore) {
        section.classList.remove("ytfm-hidden");
      }

      // Per-entry hiding for the main navigation section
      entries.forEach((entry) => {
        const link = entry.querySelector("a");
        const href = (link && link.getAttribute("href")) || "";
        const title = getEntryTitle(entry);

        let hide = false;
        if (href === "/" || title === "home")               hide = !!settings.hideHomeEntry;
        else if (href.includes("/shorts") || title === "shorts") hide = !!settings.hideShortsEntry;

        entry.classList.toggle("ytfm-hidden", hide);
      });

      // Auto-collapse section if every entry is now hidden (cleans up divider lines too)
      const anyVisible = entries.some((e) => !e.classList.contains("ytfm-hidden"));
      if (entries.length > 0 && !anyVisible) {
        section.classList.add("ytfm-hidden");
      } else if (!(isExplore || isMore)) {
        section.classList.remove("ytfm-hidden");
      }
    });

    // Mini-guide (collapsed sidebar icons)
    document.querySelectorAll("ytd-mini-guide-entry-renderer").forEach((entry) => {
      const link = entry.querySelector("a#endpoint");
      const href = (link && link.getAttribute("href")) || "";
      const label = ((link && (link.getAttribute("aria-label") || link.getAttribute("title"))) || "").toLowerCase();

      let hide = false;
      if (href === "/" || label === "home")              hide = !!settings.hideHomeEntry;
      else if (href.includes("/shorts") || label === "shorts") hide = !!settings.hideShortsEntry;

      entry.classList.toggle("ytfm-hidden", hide);
    });
  }

  // ─── Session timer ────────────────────────────────────────────────────────
  let timerEl = null;
  let timerInterval = null;

  function getSessionStart() {
    const raw = sessionStorage.getItem("ytfm_session_start");
    if (raw) return parseInt(raw, 10);
    const now = Date.now();
    sessionStorage.setItem("ytfm_session_start", String(now));
    return now;
  }

  function formatElapsed(ms) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function createTimer() {
    if (timerEl) return;
    timerEl = document.createElement("div");
    timerEl.id = "ytfm-timer";
    timerEl.innerHTML = `<span class="ytfm-icon">⏱</span><span class="ytfm-time">00:00</span>`;
    document.body.appendChild(timerEl);
    const start = getSessionStart();
    const timeEl = timerEl.querySelector(".ytfm-time");
    function tick() {
      const elapsed = Date.now() - start;
      timeEl.textContent = formatElapsed(elapsed);
      const mins = elapsed / 60000;
      timeEl.className = "ytfm-time" + (mins >= 60 ? " ytfm-danger" : mins >= 30 ? " ytfm-warn" : "");
    }
    tick();
    timerInterval = setInterval(tick, 1000);
  }

  function destroyTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (timerEl) { timerEl.remove(); timerEl = null; }
  }

  function syncTimer() {
    if (settings.showTimer) {
      if (document.body && !timerEl) createTimer();
    } else {
      destroyTimer();
    }
  }

  // ─── MutationObserver ─────────────────────────────────────────────────────
  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) processNode(node);
    }
    sweepGuideSections();
    if (settings.showTimer && !document.getElementById("ytfm-timer") && document.body) {
      timerEl = null;
      createTimer();
    }
  });

  function startObserver() {
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  // ─── SPA navigation ───────────────────────────────────────────────────────
  function onNavigate() {
    checkShortsRedirect();
    checkHomeRedirect();
    setTimeout(() => {
      document.querySelectorAll(SHELF_SELECTORS.join(",")).forEach(hideElement);
      sweepGuideSections();
    }, 300);
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    loadSettings((s) => {
      settings = s;
      applyClasses();
      checkShortsRedirect();
      checkHomeRedirect();

      const run = () => {
        startObserver();
        sweepGuideSections();
        syncTimer();
      };

      if (document.body) run();
      else document.addEventListener("DOMContentLoaded", run);

      document.addEventListener("yt-navigate-finish", onNavigate);
      document.addEventListener("yt-page-data-updated", onNavigate);

      // ─── Logo → Subscriptions redirect ───────────────────────────────────
      document.addEventListener("click", (e) => {
        if (!settings.redirectLogo) return;
        const logoLink = e.target.closest("ytd-topbar-logo-renderer a, #logo a, a.ytd-topbar-logo-renderer");
        if (!logoLink) return;
        e.preventDefault();
        e.stopPropagation();
        if (location.pathname !== "/feed/subscriptions") {
          history.pushState(null, "", "/feed/subscriptions");
          window.dispatchEvent(new PopStateEvent("popstate", { state: null }));
        }
      }, true); // capture phase so it fires before YouTube's own handler
    });
  }

  try {
    chrome.storage.onChanged.addListener((changes) => {
      Object.keys(changes).forEach((key) => { settings[key] = changes[key].newValue; });
      applyClasses();
      sweepGuideSections();
      syncTimer();
    });
  } catch {}

  init();
})();
