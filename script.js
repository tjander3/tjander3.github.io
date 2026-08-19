const carousel = document.querySelector("[data-carousel]");

if (carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const cards = [...carousel.querySelectorAll("[data-project-card]")];
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");
  let currentIndex = 0;
  let scrollTimer;

  const updateControls = () => {
    status.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === cards.length - 1;
  };

  const showProject = (index) => {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    cards[currentIndex].scrollIntoView({behavior: "smooth", block: "nearest", inline: "start"});
    updateControls();
  };

  previousButton.addEventListener("click", () => showProject(currentIndex - 1));
  nextButton.addEventListener("click", () => showProject(currentIndex + 1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showProject(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showProject(currentIndex + 1);
    }
  });

  track.addEventListener("scroll", () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      const trackLeft = track.getBoundingClientRect().left;
      currentIndex = cards.reduce((closestIndex, card, index) => {
        const currentDistance = Math.abs(card.getBoundingClientRect().left - trackLeft);
        const closestDistance = Math.abs(cards[closestIndex].getBoundingClientRect().left - trackLeft);
        return currentDistance < closestDistance ? index : closestIndex;
      }, 0);
      updateControls();
    }, 80);
  }, {passive: true});

  if (cards.length <= 1) carousel.classList.add("is-single");
  updateControls();
}
