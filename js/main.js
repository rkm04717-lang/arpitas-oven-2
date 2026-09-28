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
