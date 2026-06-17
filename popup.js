/**
 * YouTube Focus Mode - popup.js v1.1
 */

const KEYS = [
  "blockShorts",
  "hideRecommendations",
  "hideBreakingNews",
  "hidePremium",
  "hideEndscreen",
  "hideExploreSection",
  "hideSidebarLinks",
  "disableHomepage",
  "hideHomeEntry",
  "hideShortsEntry",
  "hideRecommendedVideos",
  "hideMostRelevant",
  "hideAskAi",
  "redirectLogo",
  "padComments",
  "showTimer",
];

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

const SESSION_KEY = "ytfm_session_start";

function setRowActive(key, value) {
  const row = document.getElementById("row-" + key);
  if (row) row.classList.toggle("active", value);
}

// ─── Timer display in popup ─────────────────────────────────────────────────
let popupTimerInterval = null;

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startPopupTimer() {
  const card = document.getElementById("timerCard");
  const display = document.getElementById("popupTimer");
  if (!card || !display) return;
  card.classList.add("visible");

  // Read start time from the active YouTube tab's sessionStorage via scripting
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.url.includes("youtube.com")) {
      display.textContent = "open YT";
      return;
    }

    function tick() {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const raw = sessionStorage.getItem("ytfm_session_start");
            return raw ? parseInt(raw, 10) : null;
          },
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0]) return;
          const start = results[0].result;
          if (!start) { display.textContent = "--:--"; return; }
          const elapsed = Date.now() - start;
          display.textContent = formatElapsed(elapsed);
          const mins = elapsed / 60000;
          display.className = "timer-value" +
            (mins >= 60 ? " danger" : mins >= 30 ? " warn" : "");
        }
      );
    }

    tick();
    popupTimerInterval = setInterval(tick, 1000);
  });
}

function stopPopupTimer() {
  if (popupTimerInterval) { clearInterval(popupTimerInterval); popupTimerInterval = null; }
  const card = document.getElementById("timerCard");
  if (card) card.classList.remove("visible");
}

// Reset button — clears sessionStorage on the active YT tab
document.getElementById("timerReset").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.url.includes("youtube.com")) return;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => sessionStorage.removeItem("ytfm_session_start"),
    });
  });
});

// ─── Load and wire toggles ──────────────────────────────────────────────────
chrome.storage.sync.get(DEFAULTS, (settings) => {
  KEYS.forEach((key) => {
    const checkbox = document.getElementById(key);
    if (!checkbox) return;
    const val = settings[key] ?? DEFAULTS[key];
    checkbox.checked = val;
    setRowActive(key, val);

    checkbox.addEventListener("change", () => {
      const update = { [key]: checkbox.checked };
      chrome.storage.sync.set(update);
      setRowActive(key, checkbox.checked);
      if (key === "showTimer") {
        checkbox.checked ? startPopupTimer() : stopPopupTimer();
      }
    });
  });

  if (settings.showTimer) startPopupTimer();
});
