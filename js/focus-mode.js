// focus-mode.js — mode concentration commun à tous les parcours.
// Il masque les éléments de navigation uniquement sur les pages d’apprentissage,
// sans modifier les cours, les éditeurs, les Labs/Studios ni la progression.

function focusEscapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
}

function focusModeEnabled() {
  return !!(state && state.focusMode);
}

function focusRouteInfo() {
  const path = (location.hash || "#/").replace(/^#/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  const first = segments[0] || "";
  const scoped = ["react", "css", "html", "typescript", "node", "sql"].includes(first);
  const section = scoped ? (segments[1] || "") : first;
  const eligibleSections = new Set(["cours", "exercice", "projet", "evaluation"]);
  return {
    path,
    eligible: eligibleSections.has(section),
    section,
    language: scoped ? first : "javascript"
  };
}

function focusModeButton(button) {
  if (!button) return;
  const enabled = focusModeEnabled();
  button.setAttribute("aria-pressed", String(enabled));
  button.classList.toggle("active", enabled);
  const label = button.querySelector(".focus-mode-label");
  const text = enabled ? "Mode focus : activé" : "Mode focus";
  if (label) label.textContent = button.id === "focus-mode-toggle-mobile" ? (enabled ? "Focus ✓" : "Focus") : text;
  else button.textContent = text;
  button.title = enabled ? "Désactiver le mode focus" : "Masquer les distractions pendant les leçons et exercices";
}

function syncFocusModeButtons() {
  focusModeButton(document.getElementById("focus-mode-toggle"));
  focusModeButton(document.getElementById("focus-mode-toggle-mobile"));
}

function removeFocusOverlay() {
  document.querySelectorAll("[data-focus-overlay='1']").forEach(node => node.remove());
}

function focusPageTitle() {
  const title = document.querySelector("#main .page h1")?.textContent?.trim();
  return title || "Session d’apprentissage";
}

function buildFocusOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "focus-overlay";
  overlay.dataset.focusOverlay = "1";
  overlay.setAttribute("role", "region");
  overlay.setAttribute("aria-label", "Contrôles du mode focus");
  overlay.innerHTML = `
    <div class="focus-overlay-copy">
      <span class="focus-dot" aria-hidden="true"></span>
      <span><strong>Mode focus</strong><small>${focusEscapeHtml(focusPageTitle())}</small></span>
    </div>
    <button class="focus-exit" type="button">Quitter</button>
  `;
  overlay.querySelector(".focus-exit")?.addEventListener("click", () => setFocusMode(false));
  return overlay;
}

function setFocusMode(enabled) {
  state.focusMode = !!enabled;
  commit();
  applyFocusMode();
  window.dispatchEvent(new CustomEvent("focus-mode-changed", { detail: { enabled: !!enabled } }));
}

function toggleFocusMode() {
  setFocusMode(!focusModeEnabled());
}

function applyFocusMode() {
  const enabled = focusModeEnabled();
  const route = focusRouteInfo();
  const active = enabled && route.eligible;

  document.documentElement.dataset.focusMode = enabled ? "on" : "off";
  document.body?.classList.toggle("focus-mode", active);
  document.body?.classList.toggle("focus-mode-ready", enabled);
  syncFocusModeButtons();
  removeFocusOverlay();

  if (active && document.body) {
    document.body.appendChild(buildFocusOverlay());
    document.getElementById("main")?.setAttribute("aria-label", "Contenu en mode focus");
  } else {
    document.getElementById("main")?.removeAttribute("aria-label");
  }
}

function startFocusMode() {
  const buttons = [
    document.getElementById("focus-mode-toggle"),
    document.getElementById("focus-mode-toggle-mobile")
  ];
  buttons.forEach(button => {
    if (!button || button.dataset.focusModeBound) return;
    button.dataset.focusModeBound = "1";
    button.addEventListener("click", toggleFocusMode);
  });

  window.addEventListener("hashchange", () => setTimeout(applyFocusMode, 0));
  window.addEventListener("progress-changed", syncFocusModeButtons);
  document.addEventListener("keydown", event => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      toggleFocusMode();
    }
  });
  applyFocusMode();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startFocusMode, { once: true });
else startFocusMode();
