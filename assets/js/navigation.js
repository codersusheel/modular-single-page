
/* ==========================================
   MODULAR SINGLE PAGE
   NAVIGATION SYSTEM
   Version: 1.0.0
========================================== */

(function () {
    "use strict";

    let navigationConfig = null;

    function getItems() {
        if (!navigationConfig) return [];

        const groups = navigationConfig.navigation_system || [];

        return groups.flatMap(
            group => group.items || []
        );
    }

    function getEnabledSections() {
        return new Set(
            (window.ModularApp.sections || [])
                .filter(section => section.enabled !== false)
                .map(section => section.id)
        );
    }

    function getItemsForPlacement(placement) {
        const enabledSections = getEnabledSections();

        return getItems()
            .filter(item => {
                if (item.enabled === false) return false;

                if (!Array.isArray(item.placements)) {
                    return false;
                }

                if (!item.placements.includes(placement)) {
                    return false;
                }

                if (
                    item.type === "section" &&
                    navigationConfig.settings
                        ?.hideDisabledSections !== false &&
                    !enabledSections.has(item.sectionId)
                ) {
                    return false;
                }

                return true;
            })
            .sort(
                (a, b) => (a.order || 0) - (b.order || 0)
            );
    }

    function createLink(item) {
        const link = document.createElement("a");

        link.textContent = item.name || "Link";

        const url = item.url || "#";

        if (item.type === "external") {
            try {
                const parsed = new URL(
                    url,
                    window.location.href
                );

                if (!["http:", "https:"].includes(parsed.protocol)) {
                    return null;
                }

                link.href = parsed.href;
            } catch {
                return null;
            }

            if (item.target === "_blank") {
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            }
        } else {
            if (!url.startsWith("#")) return null;

            link.href = url;
        }

        if (item.icon) {
            link.dataset.icon = item.icon;
        }

        if (item.sectionId) {
            link.dataset.sectionTarget = item.sectionId;
        }

        return link;
    }

    function renderLinks(container, placement) {
        if (!container) return;

        const items = getItemsForPlacement(placement);
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const link = createLink(item);

            if (link) {
                fragment.appendChild(link);
            }
        });

        container.replaceChildren(fragment);
    }

    function renderHeader() {
        const header = document.getElementById("header");

        if (!header) return;

        let container = header.querySelector(".nav-links");

        if (!container) {
            const nav = header.querySelector("nav");

            if (!nav) return;

            container = document.createElement("div");
            container.className = "nav-links";

            nav.appendChild(container);
        }

        renderLinks(container, "header");
    }

    function renderFooter() {
        const footer = document.getElementById("footer");

        if (!footer) return;

        let container = footer.querySelector(".footer-links");

        if (!container) {
            const footerElement = footer.querySelector("footer");

            if (!footerElement) return;

            container = document.createElement("nav");
            container.className = "footer-links";
            container.setAttribute(
                "aria-label",
                "Footer navigation"
            );

            footerElement.appendChild(container);
        }

        renderLinks(container, "footer");
    }

    function renderMobile() {
        const container = document.querySelector(
            "[data-navigation='mobile']"
        );

        if (!container) return;

        renderLinks(container, "mobile");
    }

    function render() {
        if (!navigationConfig) return;

        if (navigationConfig.settings?.enabled === false) {
            return;
        }

        if (
            navigationConfig.settings?.autoGenerate === false
        ) {
            return;
        }

        renderHeader();
        renderFooter();
        renderMobile();

        updateActiveLinks();
    }

    function updateActiveLinks() {
        const hash = window.location.hash || "#home";

        document.querySelectorAll(
            ".nav-links a, .footer-links a, " +
            "[data-navigation='mobile'] a"
        ).forEach(link => {
            const active = link.getAttribute("href") === hash;

            link.classList.toggle("active", active);

            if (active) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function init(config) {
        navigationConfig = config;

        render();

        window.addEventListener(
            "hashchange",
            updateActiveLinks
        );
    }

    window.ModularNavigation = {
        init,
        render,
        updateActiveLinks
    };

})();
