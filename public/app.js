const topLink = document.querySelector(".back-to-top");

function syncTopLink() {
  if (!topLink) return;
  topLink.classList.toggle("is-visible", window.scrollY > 320);
}

if (topLink) {
  topLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", syncTopLink, { passive: true });
  syncTopLink();
}
