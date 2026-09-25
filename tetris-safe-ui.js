const THEME_KEY = "modern_tetris_theme";
const THEME_ORDER = ["system", "light", "dark"];

const THEME_LABELS = {
  en: { system: "System theme", light: "Light theme", dark: "Dark theme" },
  hr: { system: "Tema sustava", light: "Svijetla tema", dark: "Tamna tema" },
  de: { system: "Systemdesign", light: "Helles Design", dark: "Dunkles Design" },
  it: { system: "Tema di sistema", light: "Tema chiaro", dark: "Tema scuro" },
  es: { system: "Tema del sistema", light: "Tema claro", dark: "Tema oscuro" }
};

function currentLanguage() {
  return document.getElementById("header-language-select")?.value || "en";
}

function storedTheme() {
  const value = localStorage.getItem(THEME_KEY);
  return THEME_ORDER.includes(value) ? value : "dark";
}

function resolvedTheme(choice) {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function themeIcon(choice) {
  if (choice === "light") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  if (choice === "dark") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.7 8.7 0 1 0 10.7 10.7Z"
          fill="currentColor"/>
      </svg>`;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2"
        fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 21h8M12 17v4"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
}

function applyTheme(choice = storedTheme()) {
  const resolved = resolvedTheme(choice);

  document.documentElement.dataset.agTheme = resolved;
  document.documentElement.dataset.agThemeChoice = choice;

  const button = document.getElementById("header-theme-toggle-btn");

  if (button) {
    const labels = THEME_LABELS[currentLanguage()] || THEME_LABELS.en;
    const label = labels[choice];

    button.title = label;
    button.setAttribute("aria-label", label);

    if (button.dataset.icon !== choice) {
      button.dataset.icon = choice;
      button.innerHTML = themeIcon(choice);
    }
  }

  document.querySelectorAll(".ag-theme-option").forEach((option) => {
    const selected = option.dataset.theme === choice;
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-checked", selected ? "true" : "false");
  });
}

function ensureThemeButton() {
  const languageMenu = document.querySelector(
    "#header-language-select + .ag-language-menu"
  );

  if (!languageMenu) return;

  let wrapper = document.getElementById("header-theme-menu");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "header-theme-menu";
    wrapper.className = "ag-theme-menu";

    const button = document.createElement("button");
    button.type = "button";
    button.id = "header-theme-toggle-btn";
    button.className = "ag-theme-toggle";
    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", "false");

    const options = document.createElement("div");
    options.className = "ag-theme-options";
    options.setAttribute("role", "menu");

    THEME_ORDER.forEach((choice) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "ag-theme-option";
      option.dataset.theme = choice;
      option.setAttribute("role", "menuitemradio");

      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        localStorage.setItem(THEME_KEY, choice);
        applyTheme(choice);

        wrapper.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        button.focus();
      });

      options.appendChild(option);
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const open = wrapper.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });

    button.addEventListener("keydown", (event) => {
      const themeOptions = Array.from(
        options.querySelectorAll(".ag-theme-option")
      );

      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();

        wrapper.classList.add("open");
        button.setAttribute("aria-expanded", "true");

        const selectedIndex = themeOptions.findIndex(
          (option) => option.getAttribute("aria-checked") === "true"
        );

        if (event.key === "ArrowUp") {
          const index =
            selectedIndex >= 0 ? selectedIndex : themeOptions.length - 1;
          themeOptions[index]?.focus();
        } else {
          const index = selectedIndex >= 0 ? selectedIndex : 0;
          themeOptions[index]?.focus();
        }
      } else if (
        event.key === "Escape" &&
        wrapper.classList.contains("open")
      ) {
        event.preventDefault();
        event.stopPropagation();

        wrapper.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
      }
    });

    options.addEventListener("keydown", (event) => {
      const themeOptions = Array.from(
        options.querySelectorAll(".ag-theme-option")
      );

      const current = themeOptions.indexOf(document.activeElement);

      if (
        ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(
          event.key
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (event.key === "ArrowDown") {
        const next = current < 0 ? 0 : (current + 1) % themeOptions.length;
        themeOptions[next]?.focus();
      } else if (event.key === "ArrowUp") {
        const next =
          current < 0
            ? themeOptions.length - 1
            : (current - 1 + themeOptions.length) % themeOptions.length;

        themeOptions[next]?.focus();
      } else if (event.key === "Home") {
        themeOptions[0]?.focus();
      } else if (event.key === "End") {
        themeOptions[themeOptions.length - 1]?.focus();
      } else if (event.key === "Enter" || event.key === " ") {
        document.activeElement?.click();
      } else if (event.key === "Escape") {
        wrapper.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        button.focus();
      }
    });

    wrapper.append(button, options);
    languageMenu.insertAdjacentElement("afterend", wrapper);
  }

  const labels = THEME_LABELS[currentLanguage()] || THEME_LABELS.en;

  wrapper.querySelectorAll(".ag-theme-option").forEach((option) => {
    const label = labels[option.dataset.theme];

    if (option.textContent !== label) {
      option.textContent = label;
    }
  });

  applyTheme();
}

function hideDuplicateLanguageControls() {
  const settingsSelect = document.getElementById("select-language");

  if (settingsSelect?.parentElement) {
    settingsSelect.parentElement.hidden = true;
  }

  const guideButton = document.getElementById("tab-guide-lang-en");

  if (guideButton?.parentElement) {
    guideButton.parentElement.hidden = true;
  }
}

function ensureHeaderLanguageMenu() {
  const select = document.getElementById("header-language-select");

  if (!select || !window.AppsGamesLanguageMenu) return;

  select.setAttribute("data-ag-language-menu", "");
  select.setAttribute("aria-label", "Language");

  const existingMenu = select.nextElementSibling?.classList.contains(
    "ag-language-menu"
  );

  if (!existingMenu) {
    if (select.dataset.agLanguageEnhanced === "true") {
      delete select.dataset.agLanguageEnhanced;
      select.classList.remove("ag-language-native");
      select.tabIndex = 0;
    }

    window.AppsGamesLanguageMenu.enhanceSelect(select);
  }

  if (select.dataset.safeUiBound !== "true") {
    select.dataset.safeUiBound = "true";

    select.addEventListener("change", () => {
      const lang = select.value || "en";

      if (document.documentElement.lang !== lang) {
        document.documentElement.lang = lang;
      }

      requestAnimationFrame(() => {
        hideDuplicateLanguageControls();
        ensureHeaderLanguageMenu();
        ensureThemeButton();
      });
    });
  }

  ensureThemeButton();
}

async function startSafeUi() {
  const select = document.getElementById("header-language-select");

  if (!select) return;

  select.setAttribute("data-ag-language-menu", "");

  await import("./ag-language-menu.js");

  ensureHeaderLanguageMenu();
  hideDuplicateLanguageControls();
  applyTheme();
}

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") return;

    if (document.querySelector(".ag-language-menu.open")) {
      return;
    }

    const settings = document.getElementById("settings-modal");
    if (!settings) return;

    const closeButton = document.getElementById("close-settings-modal-btn");
    if (!closeButton) return;

    event.preventDefault();
    event.stopPropagation();
    closeButton.click();
  },
  true
);

const root = document.getElementById("root");

if (root) {
  const observer = new MutationObserver(() => {
    hideDuplicateLanguageControls();

    if (window.AppsGamesLanguageMenu) {
      ensureHeaderLanguageMenu();
    }
  });

  observer.observe(root, {
    childList: true,
    subtree: true
  });
}

document.addEventListener("pointerdown", (event) => {
  const themeMenu = document.getElementById("header-theme-menu");

  if (
    themeMenu &&
    themeMenu.classList.contains("open") &&
    !themeMenu.contains(event.target)
  ) {
    themeMenu.classList.remove("open");

    document
      .getElementById("header-theme-toggle-btn")
      ?.setAttribute("aria-expanded", "false");
  }
});
const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

systemTheme.addEventListener?.("change", () => {
  if (storedTheme() === "system") {
    applyTheme("system");
  }
});

let attempts = 0;

function boot() {
  attempts += 1;

  if (document.getElementById("header-language-select")) {
    startSafeUi().catch(console.error);
    return;
  }

  if (attempts < 120) {
    requestAnimationFrame(boot);
  }
}

boot();