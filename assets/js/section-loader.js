
/* ==========================================
   MODULAR SINGLE PAGE
   SECTION LOADER
   Version: 1.0.0
========================================== */

(function () {
    "use strict";

    const loadedStyles = new Map();
    const loadedScripts = new Map();

    const DEFAULT_SETTINGS = {
        autoLoad: true,
        loadMode: "parallel",
        preserveOrder: true,
        enableFallback: true,
        keepFallbackOnError: true,
        showErrorsInConsole: true,
        enableSectionEvents: true,
        scrollToHashAfterLoad: true
    };

    function emit(name, detail = {}) {
        document.dispatchEvent(
            new CustomEvent(name, { detail })
        );
    }

    function resolvePath(path) {
        if (!path) return "";

        if (/^(https?:)?\/\//i.test(path)) {
            return path;
        }

        return new URL(
            path.replace(/^\/+/, ""),
            window.ModularApp.baseUrl
        ).href;
    }

    async function fetchJSON(path) {
        const response = await fetch(resolvePath(path));

        if (!response.ok) {
            throw new Error(
                `${path}: HTTP ${response.status}`
            );
        }

        return response.json();
    }

    function getContainer(section) {
        return document.getElementById(section.id);
    }

    function getParent(section) {
        if (section.position === "header") {
            return document.body;
        }

        if (section.position === "footer") {
            return document.body;
        }

        return document.getElementById("main-content");
    }

    function createContainer(section) {
        const element = document.createElement("div");

        element.id = section.id;
        element.dataset.section = section.id;

        return element;
    }

    function organizeSections(sections) {
        const sorted = [...sections].sort(
            (a, b) => (a.order || 0) - (b.order || 0)
        );

        const groups = {
            header: [],
            main: [],
            footer: []
        };

        sorted.forEach(section => {
            if (section.enabled === false) return;

            const position = section.position || "main";

            if (groups[position]) {
                groups[position].push(section);
            }
        });

        const main = document.getElementById("main-content");

        if (!main) return sorted;

        groups.main.forEach(section => {
            let container = getContainer(section);

            if (!container) {
                container = createContainer(section);
            }

            main.appendChild(container);
        });

        groups.header.forEach(section => {
            let container = getContainer(section);

            if (!container) {
                container = createContainer(section);
            }

            document.body.insertBefore(
                container,
                main
            );
        });

        groups.footer.forEach(section => {
            let container = getContainer(section);

            if (!container) {
                container = createContainer(section);
            }

            document.body.appendChild(container);
        });

        return sorted;
    }

    function disableSection(section) {
        const container = getContainer(section);

        if (container) {
            container.hidden = true;
            container.setAttribute("aria-hidden", "true");
        }
    }

    function enableSection(section) {
        const container = getContainer(section);

        if (container) {
            container.hidden = false;
            container.removeAttribute("aria-hidden");
        }
    }

    function loadCSS(path) {
        const url = resolvePath(path);

        if (loadedStyles.has(url)) {
            return loadedStyles.get(url);
        }

        const promise = new Promise((resolve, reject) => {
            const link = document.createElement("link");

            link.rel = "stylesheet";
            link.href = url;

            link.onload = () => resolve(url);
            link.onerror = () => reject(
                new Error(`CSS failed: ${url}`)
            );

            document.head.appendChild(link);
        });

        loadedStyles.set(url, promise);
        return promise;
    }

    function loadJS(path) {
        const url = resolvePath(path);

        if (loadedScripts.has(url)) {
            return loadedScripts.get(url);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src = url;
            script.async = false;

            script.onload = () => resolve(url);
            script.onerror = () => reject(
                new Error(`JS failed: ${url}`)
            );

            document.body.appendChild(script);
        });

        loadedScripts.set(url, promise);
        return promise;
    }

    async function loadAssets(section) {
        const css = Array.isArray(section.css)
            ? section.css
            : [];

        const js = Array.isArray(section.js)
            ? section.js
            : [];

        const results = await Promise.allSettled([
            ...css.map(loadCSS),
            ...js.map(loadJS)
        ]);

        results.forEach(result => {
            if (result.status === "rejected") {
                console.warn(result.reason);
            }
        });
    }

    async function loadSection(section) {
        const container = getContainer(section);

        if (!container) {
            return {
                id: section.id,
                status: "missing-container"
            };
        }

        if (section.enabled === false) {
            disableSection(section);

            return {
                id: section.id,
                status: "disabled"
            };
        }

        enableSection(section);

        const fallbackHTML = container.innerHTML;

        try {
            if (!section.file) {
                throw new Error(
                    `Missing HTML file for ${section.id}`
                );
            }

            const response = await fetch(
                resolvePath(section.file)
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            const html = await response.text();

            if (!html.trim()) {
                throw new Error("Empty HTML response");
            }

            container.innerHTML = html;

            await loadAssets(section);

            const result = {
                id: section.id,
                status: "loaded",
                container,
                section
            };

            emit("sectionLoaded", result);

            return result;

        } catch (error) {
            const settings = window.ModularApp.sectionSettings;

            if (
                settings.enableFallback !== false &&
                settings.keepFallbackOnError !== false
            ) {
                container.innerHTML = fallbackHTML;
            }

            if (settings.showErrorsInConsole !== false) {
                console.warn(
                    `[ModularPage] Section "${section.id}" failed:`,
                    error
                );
            }

            const result = {
                id: section.id,
                status: "fallback",
                error,
                container,
                section
            };

            emit("sectionError", result);

            return result;
        }
    }

    async function loadSections(config) {
        const settings = {
            ...DEFAULT_SETTINGS,
            ...(config.settings || {})
        };

        window.ModularApp.sectionSettings = settings;

        const sections = Array.isArray(config.sections)
            ? config.sections
            : [];

        window.ModularApp.sections = sections;

        const ordered = organizeSections(sections);

        sections.forEach(section => {
            if (section.enabled === false) {
                disableSection(section);
            }
        });

        const active = ordered.filter(
            section => section.enabled !== false
        );

        let results = [];

        if (settings.loadMode === "sequential") {
            for (const section of active) {
                results.push(await loadSection(section));
            }
        } else {
            results = await Promise.all(
                active.map(loadSection)
            );
        }

        emit("sectionsLoaded", {
            sections: active,
            results
        });

        if (
            settings.scrollToHashAfterLoad &&
            window.location.hash
        ) {
            requestAnimationFrame(() => {
                try {
                    const id = decodeURIComponent(
                        window.location.hash.slice(1)
                    );

                    document.getElementById(id)
                        ?.scrollIntoView();
                } catch (error) {
                    console.warn(error);
                }
            });
        }

        return results;
    }

    window.ModularSectionLoader = {
        loadSections,
        loadSection,
        fetchJSON,
        resolvePath
    };

})();
