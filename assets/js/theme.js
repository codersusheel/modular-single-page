
/* ==========================================
   MODULAR SINGLE PAGE
   THEME MANAGER
   Version: 1.0.0
========================================== */

(function () {
    "use strict";

    const STORAGE_KEY = "modular-page-theme";

    let themeConfig = {};
    let currentTheme = "system";

    function getSavedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Storage may be unavailable.
        }
    }

    function getSystemTheme() {
        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    }

    function getEffectiveTheme(theme) {
        return theme === "system"
            ? getSystemTheme()
            : theme;
    }

    function applyColors(theme) {
        const colors = themeConfig[theme] || {};
        const root = document.documentElement;

        const variables = {
            background: "--site-bg",
            surface: "--site-surface",
            text: "--site-text",
            muted: "--site-muted",
            border: "--site-border"
        };

        Object.entries(variables).forEach(([key, variable]) => {
            if (colors[key]) {
                root.style.setProperty(
                    variable,
                    colors[key]
                );
            } else {
                root.style.removeProperty(variable);
            }
        });

        if (themeConfig.primaryColor) {
            root.style.setProperty(
                "--site-primary",
                themeConfig.primaryColor
            );
        }

        if (themeConfig.secondaryColor) {
            root.style.setProperty(
                "--site-secondary",
                themeConfig.secondaryColor
            );
        }
    }

    function applyTheme(theme) {
        if (!["light", "dark", "system"].includes(theme)) {
            theme = "system";
        }

        currentTheme = theme;

        const effective = getEffectiveTheme(theme);
        const root = document.documentElement;

        root.dataset.theme = effective;
        root.dataset.themePreference = theme;
        root.style.colorScheme = effective;

        applyColors(effective);

        document.querySelectorAll(
            "[data-theme-toggle]"
        ).forEach(button => {
            button.setAttribute(
                "aria-label",
                `Current theme: ${theme}. Change theme`
            );

            button.dataset.currentTheme = theme;
        });

        document.dispatchEvent(
            new CustomEvent("themeChanged", {
                detail: {
                    preference: theme,
                    effective
                }
            })
        );
    }

    function setTheme(theme) {
        if (themeConfig.allowToggle === false) {
            return;
        }

        saveTheme(theme);
        applyTheme(theme);
    }

    function toggleTheme() {
        const effective = getEffectiveTheme(currentTheme);

        setTheme(
            effective === "dark" ? "light" : "dark"
        );
    }

    function bindToggle() {
        document.addEventListener("click", event => {
            const button = event.target.closest(
                "[data-theme-toggle]"
            );

            if (!button) return;

            toggleTheme();
        });
    }

    function init(config = {}) {
        themeConfig = config;

        const saved = getSavedTheme();
        const defaultTheme = config.default || "system";

        applyTheme(saved || defaultTheme);
    }

    const media = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );

    media.addEventListener("change", () => {
        if (currentTheme === "system") {
            applyTheme("system");
        }
    });

    bindToggle();

    window.ModularTheme = {
        init,
        setTheme,
        toggleTheme,
        getTheme: () => currentTheme
    };

})();
