document.addEventListener("DOMContentLoaded", () => {

  // Don't show the intro again during the same visit
  if (sessionStorage.getItem("ovenIntroSeen")) {
    return;
  }

  sessionStorage.setItem("ovenIntroSeen", "true");

  const intro = document.createElement("div");
  intro.className = "oven-loading";

  intro.innerHTML = `
    <div class="oven-loading-inner">

      <div class="oven-brand">
        ARPITA'S
        <span>OVEN</span>
      </div>

      <div class="oven-loader">
        <div class="oven-loader-fill"></div>
      </div>

      <p class="oven-loading-text">
        Preheating the oven...
      </p>

      <p class="oven-ding">
        Ding! Come on in.
      </p>

    </div>
  `;

  document.body.prepend(intro);

  setTimeout(() => {
    intro.classList.add("oven-ready");
  }, 2200);

  setTimeout(() => {
    intro.classList.add("oven-hide");
  }, 3300);

  setTimeout(() => {
    intro.remove();
  }, 4000);

});
/* =========================================
   ARPITA'S OVEN — FLOATING SPARKLES
   Site-wide decorative particles
   ========================================= */

(function () {

  // Don't create duplicates
  if (document.querySelector(".site-sparkles")) {
    return;
  }

  // Create sparkle container
  const container = document.createElement("div");

  container.className = "site-sparkles";

  // Number of particles
  const desktopCount = 7;
  const mobileCount = 5;

  const isMobile = window.innerWidth <= 600;
  const count = isMobile ? mobileCount : desktopCount;

  // Different sparkle characters
  const symbols = ["✦", "✧", "✦", "·", "✧"];

  for (let i = 0; i < count; i++) {

    const sparkle = document.createElement("span");

    sparkle.className = "site-sparkle";

    sparkle.textContent =
      symbols[Math.floor(Math.random() * symbols.length)];

    // Random position
    sparkle.style.left =
      (8 + Math.random() * 84) + "%";

    sparkle.style.top =
      (10 + Math.random() * 78) + "%";

    // Random size
    sparkle.style.fontSize =
      (7 + Math.random() * 10) + "px";

    // Random animation duration
    sparkle.style.animationDuration =
      (4 + Math.random() * 5) + "s";

    // Different animation delay
    sparkle.style.animationDelay =
      (-Math.random() * 6) + "s";

    // Slightly different opacity
    sparkle.style.opacity =
      (0.25 + Math.random() * 0.45);

    container.appendChild(sparkle);
  }

  document.body.appendChild(container);

})();
