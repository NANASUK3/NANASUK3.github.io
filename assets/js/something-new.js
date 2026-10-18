(function () {
  "use strict";

  var ideas = [
    "Training Dynamics",
    "Agentic Vision",
    "Reward Design",
    "Visual Reasoning",
    "World Models",
    "Interactive Learning",
    "Representation Learning",
    "Self-Improvement",
    "Generative Models",
    "Machine Creativity",
    "Something New",
  ];

  function initButtons() {
    document
      .querySelectorAll("[data-something-new]")
      .forEach(function (button) {
        if (button.dataset.somethingNewReady === "true") return;
        button.dataset.somethingNewReady = "true";
        var timer = null;
        var running = false;
        var original = [[button, button.textContent]];
        function restore() {
          if (timer !== null) window.clearTimeout(timer);
          timer = null;
          original.forEach(function (entry) {
            entry[0].textContent = entry[1];
          });
          button.classList.remove("is-typing");
          running = false;
        }
        function start() {
          if (running) return;
          running = true;
          var label = button;
          var index = 0;
          var reduced =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          function next() {
            if (!label || index >= ideas.length) {
              if (!label) {
                restore();
                return;
              }
              var finalText = "Something New";
              var character = 0;
              button.classList.add("is-typing");
              function typeNext() {
                if (!running) return;
                label.textContent = finalText.slice(0, character++);
                if (character <= finalText.length)
                  timer = window.setTimeout(typeNext, reduced ? 35 : 65);
                else button.classList.remove("is-typing");
              }
              typeNext();
              return;
            }
            label.textContent = ideas[index++];
            timer = window.setTimeout(next, reduced ? 160 : 85);
          }
          next();
        }
        button.addEventListener("mouseenter", start);
        button.addEventListener("mouseleave", restore);
        button.addEventListener("focus", start);
        button.addEventListener("blur", restore);
        button.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            start();
          }
        });
      });
  }
  document.addEventListener("site:publicationsrendered", initButtons);
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initButtons);
  else initButtons();
})();
