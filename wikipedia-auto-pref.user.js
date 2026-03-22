// ==UserScript==
// @name         Wikipedia Autoset Preference
// @namespace    https://www.wikipedia.org
// @version      1.0.0
// @description  Automatically set preferred display style on Wikipedia
// @license      MIT
// @match        *://*.wikipedia.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

// ── Wikipedia element IDs ────────────────────────────────────────────────────
const ID = {
    // Font size options
    FONT_SMALL: "skin-client-pref-vector-feature-custom-font-size-value-0",
    FONT_STANDARD: "skin-client-pref-vector-feature-custom-font-size-value-1",
    FONT_LARGE: "skin-client-pref-vector-feature-custom-font-size-value-2",

    // Width options
    WIDTH_WIDE: "skin-client-pref-vector-feature-limited-width-value-0",
    WIDTH_STANDARD: "skin-client-pref-vector-feature-limited-width-value-1",

    // Theme options
    THEME_DARK: "skin-client-pref-skin-theme-value-night",
    THEME_LIGHT: "skin-client-pref-skin-theme-value-day",
    THEME_AUTO: "skin-client-pref-skin-theme-value-auto",

    // Appearance Panel that contains the above options.
    APPEARANCE_CONTAINER: "vector-appearance-pinned-container",

    // Panels (used to find unpin buttons within)
    APPEARANCE_PANEL: "vector-appearance",

    // Banner
    BANNER: "centralNotice",
};

// ── GM storage keys ──────────────────────────────────────────────────────────
const STORAGE_KEY = {
    FONT_SIZE: "fontSize",
    WIDTH: "width",
    THEME: "theme",
    HIDE_APPEARANCE: "hideAppearance",
    HIDE_BANNER: "hideBanner",
};

// ── CSS class names ──────────────────────────────────────────────────────────
const CSS = {
    UNPIN_BUTTON: "vector-pinnable-header-unpin-button",
};

// ── Option lists (label + element ID) ───────────────────────────────────────
const FONT_OPTIONS = [
    { label: "Small", value: ID.FONT_SMALL },
    { label: "Standard", value: ID.FONT_STANDARD },
    { label: "Large", value: ID.FONT_LARGE },
];

const WIDTH_OPTIONS = [
    { label: "Wide", value: ID.WIDTH_WIDE },
    { label: "Standard", value: ID.WIDTH_STANDARD },
];

const THEME_OPTIONS = [
    { label: "Dark", value: ID.THEME_DARK },
    { label: "Light", value: ID.THEME_LIGHT },
    { label: "Auto", value: ID.THEME_AUTO },
];

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULTS = {
    fontSize: ID.FONT_STANDARD,
    width: ID.WIDTH_WIDE,
    theme: ID.THEME_DARK,
    hideAppearance: true,
    hideBanner: true,
};

// ── Load persisted config (falls back to defaults) ───────────────────────────
const cfg = {
    fontSize: GM_getValue(STORAGE_KEY.FONT_SIZE, DEFAULTS.fontSize),
    width: GM_getValue(STORAGE_KEY.WIDTH, DEFAULTS.width),
    theme: GM_getValue(STORAGE_KEY.THEME, DEFAULTS.theme),
    hideAppearance: GM_getValue(STORAGE_KEY.HIDE_APPEARANCE, DEFAULTS.hideAppearance),
    hideBanner: GM_getValue(STORAGE_KEY.HIDE_BANNER, DEFAULTS.hideBanner),
};

// ── Config menu helpers ───────────────────────────────────────────────────────
const labelOf = (options, currentValue) =>
    options.find(({ value }) => value === currentValue)?.label ?? currentValue;

const pickOption = (options, currentValue, promptTitle) => {
    const names = options.map(({ label }) => label).join("\n  ");
    const answer = prompt(
        `${promptTitle}\n\nChoose (type exact name):\n  ${names}\n\nCurrent: ${labelOf(options, currentValue)}`,
        labelOf(options, currentValue)
    );
    if (answer === null) return currentValue;
    return options.find(({ label }) => label.toLowerCase() === answer.toLocaleLowerCase())?.value ?? currentValue;
};

// ── Config menu — one command per setting ────────────────────────────────────
GM_registerMenuCommand("Set Font Size", () => {
    const newValue = pickOption(FONT_OPTIONS, cfg.fontSize, "Font Size");
    GM_setValue(STORAGE_KEY.FONT_SIZE, newValue);
    alert("Font size saved. Reload the page to apply.");
});

GM_registerMenuCommand("Set Article Width", () => {
    const newValue = pickOption(WIDTH_OPTIONS, cfg.width, "Article Width");
    GM_setValue(STORAGE_KEY.WIDTH, newValue);
    alert("Article width saved. Reload the page to apply.");
});

GM_registerMenuCommand("Set Color Theme", () => {
    const newValue = pickOption(THEME_OPTIONS, cfg.theme, "Color Theme");
    GM_setValue(STORAGE_KEY.THEME, newValue);
    alert("Color theme saved. Reload the page to apply.");
});

GM_registerMenuCommand("Hide appearance settings panel (right settings column)?", () => {
    const newValue = confirm("Hide the appearance settings panel (right settings column)?\n(OK = yes, Cancel = no)");
    GM_setValue(STORAGE_KEY.HIDE_APPEARANCE, newValue);
    alert("Appearance panel setting saved. Reload the page to apply.");
});

GM_registerMenuCommand("Hide banner?", () => {
    const newValue = confirm("Hide page banner?\n(OK = yes, Cancel = no)");
    GM_setValue(STORAGE_KEY.HIDE_BANNER, newValue);
    alert("Central banner setting saved. Reload the page to apply.");
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const clickById = (id) => document.getElementById(id)?.click();

const unpinPanel = (panelId) => {
    document
        .getElementById(panelId)
        ?.getElementsByClassName(CSS.UNPIN_BUTTON)[0]
        ?.click();
};

// ── Main logic ────────────────────────────────────────────────────────────────
const intv = setInterval(() => {
    const size = document.getElementById(cfg.fontSize);
    const width = document.getElementById(cfg.width);
    const theme = document.getElementById(cfg.theme);
    const appearance = document.getElementById(ID.APPEARANCE_CONTAINER);

    if (!size || !width || !theme || !appearance) return;

    clearInterval(intv);

    clickById(cfg.fontSize);
    clickById(cfg.width);
    clickById(cfg.theme);

    if (cfg.hideAppearance && appearance.children.length > 0) {
        unpinPanel(ID.APPEARANCE_PANEL);
    }

    if (cfg.hideBanner) {
        const notice = document.getElementById(ID.BANNER);
        if (notice?.innerHTML) {
            if (mw?.centralNotice?.hideBanner) {
                mw.centralNotice.hideBanner();
            } else {
                notice.style.display = "none";
            }
        }
    }
}, 1000);