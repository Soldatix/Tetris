/* Modern Tetris — original publisher Adsterra GET CODE, intro only.
 * One parser-time request on the approved domain and ONLY with current
 * shared first-party advertising opt-in. No ad calls on previews/offline.
 * No reload/refresh after starting a game or returning to menu.
 * Parser-time document.write has shown ads in prior pilots; formal
 * provider confirmation of this method remains outstanding.
 */
(() => {
  "use strict";
  if (location.hostname !== "tetris.appsandgames.org") return;
  if (document.readyState !== "loading") return;
  if (navigator.onLine === false) return;
  const current = document.currentScript;
  const slot = current?.parentElement;
  const area = slot?.parentElement;
  if (!slot?.classList.contains("tetris-ad-unit") ||
      area?.id !== "tetris-ad-area") return;
  if (!matchMedia("(min-width: 320px)").matches) return;
  // Tetris renders its initial idle menu on every new navigation.
  const desktop = matchMedia("(min-width: 800px)").matches;
  const unit = current.dataset.unit;
  if ((desktop && unit !== "desktop") || (!desktop && unit !== "mobile")) return;

  let allowed = false;
  try {
    const entry = document.cookie.split(";").map(s => s.trim())
      .find(s => s.startsWith("ag_privacy_choices_v1="));
    const data = entry && JSON.parse(decodeURIComponent(
      entry.slice("ag_privacy_choices_v1=".length)));
    const age = data && Date.now() - data.timestamp;
    allowed = !!data && data.version === 1 &&
      data.partnerRevision === "adsterra-2026-11" &&
      data.advertising === true &&
      Number.isFinite(age) && age >= 0 &&
      age <= 180 * 24 * 60 * 60 * 1000;
  } catch (_) { allowed = false; }
  if (!allowed) return;

  const tags = {
    desktop: "<script>\n  atOptions = {\n    'key' : '3526510ea1930c4210d9283e7868999d',\n    'format' : 'iframe',\n    'height' : 90,\n    'width' : 728,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/3526510ea1930c4210d9283e7868999d\"></script>",
    mobile: "<script>\n  atOptions = {\n    'key' : '5e504b901516e507d1fa3b2ad25bb062',\n    'format' : 'iframe',\n    'height' : 50,\n    'width' : 320,\n    'params' : {}\n  };\n</script>\n<script src=\"https://bauval.org/22/5e504b901516e507d1fa3b2ad25bb062\"></script>"
  };
  area.hidden = false;
  slot.hidden = false;
  const label = document.createElement("span");
  label.className = "tetris-ad-label";
  label.textContent = "Advertisement";
  slot.insertBefore(label, current);
  document.write(tags[unit]);
})();
