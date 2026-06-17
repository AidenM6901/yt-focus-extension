<div align="center">

<img src="https://img.shields.io/badge/-%F0%9F%8E%AF%20YT%20Focus%20Mode-FF0000?style=for-the-badge&labelColor=0f0f0f&color=FF0000" alt="YT Focus Mode" height="42" />

**Strip YouTube back to what you actually came for.**  
Every distraction is a toggle... keep what you want, hide the rest.

<br />

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://chromewebstore.google.com)
[![YouTube](https://img.shields.io/badge/Works%20on-YouTube-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://youtube.com)
[![No Data Collected](https://img.shields.io/badge/Privacy-No%20Data%20Collected-22c55e?style=flat-square)](#privacy)
[![Free](https://img.shields.io/badge/Price-Free-22c55e?style=flat-square)](#install)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20me-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white)](https://ko-fi.com/aidenm6901)

</div>

---

## What is this?

YouTube is an attention machine. Every surface is designed to pull you deeper with recommendations, Shorts, the homepage, the sidebar, algorithmic shelves. YT Focus Mode turns all of that into toggles.

Turn on what you want blocked. Turn off what you want back. It takes effect instantly, remembers your preferences, and never phones home.

---

## Toggles

Everything is optional. Here's the full list, grouped by section.

### 🔴 Core

| Toggle | What it does | Default |
|--------|-------------|---------|
| **Block Shorts** | Redirects `/shorts/` URLs to normal watch, hides all Shorts shelves and cards | ✅ On |
| **Hide Recommendations Sidebar** | Removes the "Up next" panel on watch pages. Playlist sidebar still shows | ✅ On |
| **Hide Breaking News** | Removes news shelves from the feed | ✅ On |
| **Block Premium Upsells** | Hides all "Try Premium" banners, buttons, and popups | ✅ On |

### 🏠 Homepage

| Toggle | What it does | Default |
|--------|-------------|---------|
| **Redirect Home → Subscriptions** | Visiting youtube.com goes straight to your sub feed | ✅ On |
| **Redirect Logo → Subscriptions** | Clicking the YouTube logo skips the home page entirely | ✅ On |
| **Hide Recommended Videos** | Removes the video grid on the home page | ⬜ Off |
| **Hide "Most Relevant" Section** | Removes the algorithmic shelf in your subscriptions feed | ⬜ Off |

### 📋 Guide

| Toggle | What it does | Default |
|--------|-------------|---------|
| **Hide Home Button** | Removes Home from the left guide | ✅ On |
| **Hide Shorts Button** | Removes Shorts from the left guide | ✅ On |
| **Hide Explore Section** | Removes Trending, Gaming, News, etc. | ✅ On |
| **Hide More from YouTube** | Removes Premium, Music, Kids & TV links | ✅ On |

### ⚙️ Extra

| Toggle | What it does | Default |
|--------|-------------|---------|
| **Hide Ask AI Button** | Removes the Gemini AI button under videos | ⬜ Off |
| **Add Comments Padding** | Adds breathing room so comments don't span full width | ⬜ Off |
| **Hide End-screen Cards** | No video wall when a video finishes | ⬜ Off |
| **Session Timer** | Shows time spent on YouTube this session with a subtle overlay | ⬜ Off |

---

## Install

### Chrome Web Store *(easiest)*

> Coming soon — will be linked here once live.

### Manual install

```
1. Download the latest release zip from the Releases tab →
2. Extract the zip to a folder
3. Open chrome://extensions in Chrome
4. Enable Developer Mode (top-right toggle)
5. Click "Load unpacked" → select the extracted folder
```

Done. The 🎯 icon will appear in your toolbar.

---

## Privacy

**This extension collects nothing.**

- ✅ Settings saved locally in `chrome.storage.sync` — stays in your own Chrome, never hits any server I run
- ✅ No analytics, no tracking, no external requests
- ✅ No accounts, no sign-in, no telemetry
- ✅ All source code is in this repo and viewable

Full privacy policy: [extensions.aiden-morrison.com/yt-focus-mode-privacy.html](https://extensions.aiden-morrison.com/yt-focus-mode-privacy.html)

---

## Permissions

| Permission | Why |
|-----------|-----|
| `storage` | Save your toggle settings across your own Chrome devices |
| `scripting` | Run the content script that modifies YouTube |
| `activeTab` | Read the session timer from the current YouTube tab when you open the popup |

---

## Support

If this saves you time or helps you stay focused, a coffee goes a long way.

<a href="https://ko-fi.com/aidenm6901">
  <img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white" alt="Ko-fi" />
</a>

---

<div align="center">
  <sub>Made by <a href="https://extensions.aiden-morrison.com">Aiden Morrison</a> · <a href="https://extensions.aiden-morrison.com/yt-focus-mode-privacy.html">Privacy Policy</a> · <a href="https://ko-fi.com/aidenm6901">Ko-fi</a></sub>
</div>
