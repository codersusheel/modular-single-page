
/* ==========================================
   MODULAR SINGLE PAGE
   MAIN APPLICATION
   Version: 1.0.0
   Developer: Codersusheel
========================================== */

(function () {
    "use strict";

    const SCRIPT = document.currentScript;

    const APP_BASE_URL = SCRIPT
        ? new URL("../../", SCRIPT.src).href
        : new URL("./", window.location.href).href;

    const APP = {
        name: "Modular Single Page",
        version: "1.0.0",
        baseUrl: APP_BASE_URL,

        website: null,
        sections: [],
        navigation: null,
        sectionSettings: {},

        initialized: false,
        loading: false
    };

    window.ModularApp = APP;

    function emit(name, detail = {}) {
        document.dispatchEvent(
            new CustomEvent(name, { detail })
        );
    }

    function log(...args) {
        console.log("[ModularPage]", ...args);
    }

    function warn(...args) {
        console.warn("[ModularPage]", ...args);
    }

    function getLoader() {
        if (!window.ModularSectionLoader) {
            throw new Error(
                "section-loader.js is not available"
            );
        }

        return window.ModularSectionLoader;
    }

    async function loadConfig(path) {
        try {
            return await getLoader().fetchJSON(path);
        } catch (error) {
            warn(`Configuration failed: ${path}`, error);
            return null;
        }
    }

    function applyWebsiteConfig(config) {
        if (!config) return;

        APP.website = config;

        const seo = config.seo || {};
        const branding = config.branding || {};

        if (seo.title) {
            document.title = seo.title;
        }

        if (seo.description) {
            let meta = document.querySelector(
                'meta[name="description"]'
            );

            if (!meta) {
                meta = document.createElement("meta");
                meta.name = "description";
                document.head.appendChild(meta);
            }

            meta.content = seo.description;
        }

        if (branding.favicon) {
            let icon = document.querySelector(
                'link[rel="icon"]'
            );

            if (!icon) {
                icon = document.createElement("link");
                icon.rel = "icon";
                document.head.appendChild(icon);
            }

            icon.href = getLoader().resolvePath(
                branding.favicon
            );
        }

        if (config.website?.scrollBehavior) {
            document.documentElement.style.scrollBehavior =
                config.website.scrollBehavior;
        }
    }

    function updateBranding() {
        const branding = APP.website?.branding;

        if (!branding) return;

        document.querySelectorAll(
            ".site-header .logo"
        ).forEach(element => {
            if (branding.logoText) {
                element.textContent = branding.logoText;
            }
        });
    }

    function updateFooter() {
        const footerConfig = APP.website?.footer;

        if (!footerConfig) return;

        const footer = document.getElementById("footer");

        if (!footer) return;

        const copyright = footer.querySelector(
            "[data-copyright]"
        );

        if (copyright) {
            copyright.textContent =
                `© ${footerConfig.copyrightYear || new Date().getFullYear()} ` +
                `${footerConfig.copyrightHolder || APP.name}.`;
        }
    }

    function setupBackToTop() {
        if (
            APP.website?.website?.showBackToTop !== true
        ) {
            return;
        }

        if (document.getElementById("back-to-top")) {
            return;
        }

        const button = document.createElement("button");

        button.id = "back-to-top";
        button.type = "button";
        button.textContent = "↑";
        button.setAttribute(
            "aria-label",
            "Back to top"
        );

        button.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 46px;
            height: 46px;
            border: none;
            border-radius: 50%;
            background: var(--site-primary, #2563eb);
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            z-index: 999;
            display: none;
        `;

        document.body.appendChild(button);

        function updateVisibility() {
            button.style.display =
                window.scrollY > 400
                    ? "block"
                    : "none";
        }

        button.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        window.addEventListener(
            "scroll",
            updateVisibility,
            { passive: true }
        );

        updateVisibility();
    }

    async function initialize() {
        if (APP.initialized || APP.loading) {
            return;
        }

        APP.loading = true;

        emit("appLoading");

        try {
            log("Initializing application...");

            const [
                websiteConfig,
                sectionsConfig,
                navigationConfig
            ] = await Promise.all([
                loadConfig("config/website.json"),
                loadConfig("config/sections.json"),
                loadConfig("config/navigation.json")
            ]);

            applyWebsiteConfig(websiteConfig);

            if (window.ModularTheme) {
                window.ModularTheme.init(
                    websiteConfig?.theme || {}
                );
            }

            if (sectionsConfig) {
                await getLoader().loadSections(
                    sectionsConfig
                );
            } else {
                warn(
                    "Using existing HTML fallback sections."
                );
            }

            if (
                navigationConfig &&
                window.ModularNavigation
            ) {
                APP.navigation = navigationConfig;

                window.ModularNavigation.init(
                    navigationConfig
                );
            }

            updateBranding();
            updateFooter();
            setupBackToTop();

            APP.initialized = true;

            emit("websiteLoaded", {
                app: APP
            });

            log("Website initialized successfully.");

        } catch (error) {
            warn("Initialization error:", error);

            emit("appError", {
                error
            });

        } finally {
            APP.loading = false;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }

    APP.reload = initialize;

})();
