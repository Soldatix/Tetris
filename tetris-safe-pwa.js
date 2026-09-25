const PWA_TEXT = {
  en: {
    title: "Install Modern Tetris",
    text: "Install the Web App for quick access in a standalone game window.",
    install: "Install Web App",
    continue: "Continue in browser",
    waiting: "Checking whether installation is available…",
    ready: "The game is ready to install.",
    installing: "Opening the install dialog…",
    installed: "Modern Tetris is installed.",
    installedButton: "Installed",
    dismissed: "Installation was dismissed. You can keep playing in the browser.",
    unavailable: "The automatic install dialog is not available right now. You can also install from your browser menu."
  },
  hr: {
    title: "Instaliraj Moderni Tetris",
    text: "Instaliraj Web App za brzi pristup u zasebnom prozoru igre.",
    install: "Instaliraj Web App",
    continue: "Nastavi u pregledniku",
    waiting: "Provjeravam je li instalacija dostupna…",
    ready: "Igra je spremna za instalaciju.",
    installing: "Otvaram instalacijski dijalog…",
    installed: "Moderni Tetris je instaliran.",
    installedButton: "Instalirano",
    dismissed: "Instalacija je otkazana. Možeš nastaviti igrati u pregledniku.",
    unavailable: "Automatski instalacijski dijalog trenutačno nije dostupan. Instalaciju možeš pokrenuti i iz izbornika preglednika."
  },
  de: {
    title: "Modernes Tetris installieren",
    text: "Installiere die Web App für schnellen Zugriff in einem eigenen Spielfenster.",
    install: "Web-App installieren",
    continue: "Im Browser fortfahren",
    waiting: "Es wird geprüft, ob die Installation verfügbar ist…",
    ready: "Das Spiel ist zur Installation bereit.",
    installing: "Installationsdialog wird geöffnet…",
    installed: "Modernes Tetris ist installiert.",
    installedButton: "Installiert",
    dismissed: "Die Installation wurde abgebrochen. Du kannst im Browser weiterspielen.",
    unavailable: "Der automatische Installationsdialog ist derzeit nicht verfügbar. Du kannst auch über das Browsermenü installieren."
  },
  it: {
    title: "Installa Tetris Moderno",
    text: "Installa la Web App per un accesso rapido in una finestra di gioco dedicata.",
    install: "Installa Web App",
    continue: "Continua nel browser",
    waiting: "Verifica della disponibilità dell'installazione…",
    ready: "Il gioco è pronto per l'installazione.",
    installing: "Apertura della finestra di installazione…",
    installed: "Tetris Moderno è installato.",
    installedButton: "Installato",
    dismissed: "Installazione annullata. Puoi continuare a giocare nel browser.",
    unavailable: "La finestra automatica di installazione non è disponibile al momento. Puoi installare anche dal menu del browser."
  },
  es: {
    title: "Instalar Tetris Moderno",
    text: "Instala la Web App para acceder rápidamente en una ventana de juego independiente.",
    install: "Instalar Web App",
    continue: "Continuar en el navegador",
    waiting: "Comprobando si la instalación está disponible…",
    ready: "El juego está listo para instalarse.",
    installing: "Abriendo el diálogo de instalación…",
    installed: "Tetris Moderno está instalado.",
    installedButton: "Instalado",
    dismissed: "La instalación se canceló. Puedes seguir jugando en el navegador.",
    unavailable: "El diálogo automático de instalación no está disponible ahora. También puedes instalar desde el menú del navegador."
  }
};

let deferredInstallPrompt = null;
let installStatus = "waiting";

let installRequested =
  new URLSearchParams(window.location.search).get("install") === "web";

function pwaLanguage() {
  const value = document.getElementById("header-language-select")?.value || "en";
  return PWA_TEXT[value] ? value : "en";
}

function pwaText() {
  return PWA_TEXT[pwaLanguage()];
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function removeInstallQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("install");
  history.replaceState({}, "", url.pathname + url.search + url.hash);
}

function renderInstallPanel() {
  if (!installRequested) return;

  let panel = document.getElementById("webInstallBanner");

  if (!panel) {
    panel = document.createElement("aside");
    panel.id = "webInstallBanner";
    panel.className = "web-install-banner";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-live", "polite");
    document.body.appendChild(panel);
  }

  if (isStandalone()) {
    installStatus = "installed";
  }

  const text = pwaText();

  panel.innerHTML = `
    <div class="web-install-heading">
      <img
        class="web-install-icon"
        src="./icons/tetris-192.png"
        alt=""
        aria-hidden="true"
      >
      <div>
        <strong>${text.title}</strong>
        <p>${text.text}</p>
      </div>
    </div>

    <p class="web-install-status">${text[installStatus]}</p>

    <div class="web-install-actions">
      <button
        type="button"
        id="installWebAppButton"
        class="web-install-primary"
        ${(!deferredInstallPrompt || installStatus === "installed") ? "disabled" : ""}
      >
        ${installStatus === "installed" ? text.installedButton : text.install}
      </button>

      <button
        type="button"
        id="continueWebButton"
        class="web-install-secondary"
      >
        ${text.continue}
      </button>
    </div>
  `;

  document
    .getElementById("installWebAppButton")
    ?.addEventListener("click", installWebApplication);

  document
    .getElementById("continueWebButton")
    ?.addEventListener("click", () => {
      installRequested = false;
      panel.remove();
      removeInstallQuery();
    });
}

async function installWebApplication() {
  if (!deferredInstallPrompt) return;

  installStatus = "installing";
  renderInstallPanel();

  deferredInstallPrompt.prompt();

  const result = await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;

  installStatus =
    result.outcome === "accepted"
      ? "installed"
      : "dismissed";

  renderInstallPanel();
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();

  deferredInstallPrompt = event;
  installStatus = "ready";

  renderInstallPanel();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installStatus = "installed";
  renderInstallPanel();
});

document
  .getElementById("header-language-select")
  ?.addEventListener("change", () => {
    if (installRequested) renderInstallPanel();
  });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((error) => console.warn("Service Worker registration failed:", error));
  });
}

if (installRequested) {
  renderInstallPanel();

  setTimeout(() => {
    if (
      !deferredInstallPrompt &&
      !isStandalone() &&
      installStatus === "waiting"
    ) {
      installStatus = "unavailable";
      renderInstallPanel();
    }
  }, 2500);
}