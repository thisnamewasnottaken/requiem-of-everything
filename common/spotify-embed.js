(function () {
  function mount(container, key, fallbackUrl) {
    if (!container) return;

    const scope = container.closest("#card, #life") || container;
    scope.querySelectorAll("[data-roe-player]").forEach(player => player.remove());

    const item = window.ROE_SPOTIFY?.[key];
    if (!item) {
      if (fallbackUrl) window.open(fallbackUrl, "_blank", "noopener");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.src = `https://open.spotify.com/embed/${item.type}/${item.id}?utm_source=generator&theme=0`;
    iframe.width = "100%";
    iframe.height = "152";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    iframe.setAttribute("loading", "lazy");
    iframe.style.borderRadius = "12px";
    iframe.title = `Spotify player: ${item.title}`;
    iframe.dataset.roePlayer = "true";
    container.replaceChildren(iframe);
  }

  document.addEventListener("click", event => {
    const link = event.target.closest("[data-roe-key]");
    if (!link) return;

    const container = link.closest("li, .show")?.querySelector(".spotify-player");
    if (!container) return;

    event.preventDefault();
    mount(container, link.dataset.roeKey, link.href || link.dataset.fallback);
  });

  window.ROE_PLAYER = { mount };
})();
