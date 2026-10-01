/* =========================================================
   ARPITA'S OVEN — SITE SOUND SYSTEM
========================================================= */

(function () {

  const STORAGE_KEY = "arpitasOvenSound";

  let soundEnabled =
    localStorage.getItem(STORAGE_KEY) !== "off";


  const sounds = {

    click:
      new Audio("/sounds/click.mp3"),

    chime:
      new Audio("/sounds/chime.mp3"),

    success:
      new Audio("/sounds/success.mp3")

  };


  Object.values(sounds).forEach(
    function (audio) {

      audio.preload = "auto";
      audio.volume = 0.28;

    }
  );


  function playSound(name) {

    if (!soundEnabled) {
      return;
    }


    const original =
      sounds[name];


    if (!original) {
      return;
    }


    const audio =
      original.cloneNode();


    audio.volume =
      original.volume;


    audio.play().catch(
      function () {
        // Browser may block audio
        // until the user interacts.
      }
    );

  }


  /* =================================
     SOUND TOGGLE
  ================================= */

  function createToggle() {

    if (
      document.querySelector(
        ".sound-toggle"
      )
    ) {

      return;

    }


    const button =
      document.createElement(
        "button"
      );


    button.className =
      "sound-toggle";


    button.type =
      "button";


    button.setAttribute(
      "aria-label",
      soundEnabled
        ? "Turn sound off"
        : "Turn sound on"
    );


    button.innerHTML =
      soundEnabled
        ? "🔊"
        : "🔇";


    button.addEventListener(
      "click",
      function () {

        soundEnabled =
          !soundEnabled;


        localStorage.setItem(
          STORAGE_KEY,
          soundEnabled
            ? "on"
            : "off"
        );


        button.innerHTML =
          soundEnabled
            ? "🔊"
            : "🔇";


        button.setAttribute(
          "aria-label",
          soundEnabled
            ? "Turn sound off"
            : "Turn sound on"
        );


        if (soundEnabled) {

          playSound("chime");

        }

      }
    );


    document.body.appendChild(
      button
    );

  }



  /* =================================
     BUTTON / LINK SOUNDS
  ================================= */

  document.addEventListener(
    "click",
    function (event) {

      const target =
        event.target.closest(
          "a, button"
        );


      if (!target) {
        return;
      }


      if (
        target.classList.contains(
          "sound-toggle"
        )
      ) {

        return;

      }


      /*
        Don't make every tiny admin
        control noisy.
      */

      if (
        target.closest(
          ".admin-header"
        )
      ) {

        return;

      }


      playSound("click");

    }
  );



  /* =================================
     PUBLIC API
  ================================= */

  window.ArpitasOvenSounds = {

    play:
      playSound,

    enable:
      function () {

        soundEnabled = true;

        localStorage.setItem(
          STORAGE_KEY,
          "on"
        );

      },

    disable:
      function () {

        soundEnabled = false;

        localStorage.setItem(
          STORAGE_KEY,
          "off"
        );

      },

    isEnabled:
      function () {

        return soundEnabled;

      }

  };



  /* =================================
     START
  ================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      createToggle
    );

  } else {

    createToggle();

  }

})();
