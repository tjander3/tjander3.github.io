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

const trainingStats = document.querySelector("[data-training-stats]");

if (trainingStats) {
  const allowedLifts = ["squat", "bench", "deadlift"];
  const formatWeight = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1});

  const renderTrainingStats = (snapshot) => {
    if (
      snapshot?.schemaVersion !== 1 ||
      snapshot.unit !== "lb" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.asOf) ||
      !Array.isArray(snapshot.lifts) ||
      snapshot.lifts.length !== allowedLifts.length
    ) {
      throw new Error("Unexpected training stats format.");
    }

    const lifts = new Map(snapshot.lifts.map((lift) => [lift.id, lift]));
    for (const id of allowedLifts) {
      const lift = lifts.get(id);
      if (
        !lift ||
        !Number.isFinite(lift.trainingMax) ||
        !Number.isFinite(lift.estimatedOneRepMax)
      ) {
        throw new Error("Incomplete training stats.");
      }

      const row = trainingStats.querySelector(`[data-training-lift="${id}"]`);
      row.querySelector('[data-stat="trainingMax"]').textContent = formatWeight.format(lift.trainingMax);
      row.querySelector('[data-stat="estimatedOneRepMax"]').textContent = formatWeight.format(lift.estimatedOneRepMax);
    }

    const asOf = new Date(`${snapshot.asOf}T12:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    trainingStats.querySelector("[data-training-as-of]").textContent = `AS OF ${asOf.toUpperCase()}`;
  };

  fetch("data/training-stats.json", {cache: "no-store"})
    .then((response) => {
      if (!response.ok) throw new Error(`Training stats request failed (${response.status}).`);
      return response.json();
    })
    .then(renderTrainingStats)
    .catch((error) => console.warn("Using last known training stats.", error));
}
