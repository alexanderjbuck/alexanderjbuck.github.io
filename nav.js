/**
 * Sticky section nav: highlight the link for the section in view.
 */
(function () {
  const links = Array.from(document.querySelectorAll(".side-nav a[data-nav]"));
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      const el = id ? document.getElementById(id) : null;
      return el ? { id, el, link } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    for (const { link } of sections) {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  // Prefer the section nearest the top third of the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length) {
        setActive(visible[0].target.id);
        return;
      }

      // Fallback when nothing intersects (fast scroll / short viewport):
      // pick the last section whose top is above the midpoint
      const mid = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const { id, el } of sections) {
        if (el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive(current);
    },
    {
      root: null,
      // Shrink the "active" band toward the upper part of the viewport
      rootMargin: "-10% 0px -55% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 1],
    }
  );

  for (const { el } of sections) {
    observer.observe(el);
  }

  // Initial state from hash or first section
  const hashId = location.hash.slice(1);
  if (hashId && sections.some((s) => s.id === hashId)) {
    setActive(hashId);
  } else {
    setActive(sections[0].id);
  }

  // Smooth scroll is CSS; ensure active state updates on click immediately
  for (const { link, id } of sections) {
    link.addEventListener("click", () => setActive(id));
  }
})();
