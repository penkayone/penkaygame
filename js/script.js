(() => {
    const toast = document.getElementById("toast");

    const showToast = (msg) => {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        window.clearTimeout(showToast._t);
        showToast._t = window.setTimeout(() => toast.classList.remove("show"), 1400);
    };
    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
        shareBtn.addEventListener("click", async () => {
            const url = window.location.href;
            const title = document.title || "Website";

            if (navigator.share) {
                try {
                    await navigator.share({title, url});
                    return;
                } catch (e) {
                }
            }
            try {
                await navigator.clipboard.writeText(url);
                showToast("Link copied ✅");
            } catch (e) {
                showToast("Copy not supported");
            }
        });
    }
    const accordions = document.querySelectorAll(".accordion");
    const closeAllExcept = (current) => {
        accordions.forEach((acc) => {
            if (acc !== current) {
                acc.classList.remove("is-open");
                const btn = acc.querySelector(".acc-header");
                const panel = acc.querySelector(".acc-panel");
                if (btn) btn.setAttribute("aria-expanded", "false");
                if (panel) panel.style.maxHeight = "0px";
            }
        });
    };
    accordions.forEach((acc) => {
        const btn = acc.querySelector(".acc-header");
        const panel = acc.querySelector(".acc-panel");
        if (!btn || !panel) return;

        panel.style.maxHeight = "0px";
        btn.setAttribute("aria-expanded", "false");

        btn.addEventListener("click", () => {
            const willOpen = !acc.classList.contains("is-open");

            closeAllExcept(acc);

            acc.classList.toggle("is-open", willOpen);
            btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
            panel.style.maxHeight = willOpen ? `${panel.scrollHeight}px` : "0px";
        });

        window.addEventListener("resize", () => {
            if (acc.classList.contains("is-open")) {
                panel.style.maxHeight = `${panel.scrollHeight}px`;
            }
        });
    });
})();