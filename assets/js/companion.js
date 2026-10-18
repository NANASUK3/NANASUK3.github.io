(function () {
  "use strict";

  function initCompanion() {
    var pet = document.querySelector("[data-deepseek-pet]");
    if (!pet) return;


    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var deepseekButton = pet.querySelector(".deepseek-pet__button");
    var poseImage = pet.querySelector(".deepseek-pet__pose");
    var message = pet.querySelector(".deepseek-pet__message");
    var reactionIcon = pet.querySelector(".deepseek-pet__reaction-icon");
    if (!deepseekButton || !message) return;
    var poseBase =
      pet.getAttribute("data-deepseek-pose-base") || "/images/deepseek/poses/";
    var poseVersion =
      pet.getAttribute("data-deepseek-pose-version") || "20261009-beg1";
    var preloadedPoses = Object.create(null);
    var messageTimer = null;
    var holdTimer = null;
    var blinkTimer = null;
    var blinkEndTimer = null;
    var longPressTriggered = false;
    var reactionIndex = 4;
    var activeReactionId = 0;
    var reactions = [
      {
        action: "hello",
        pose: "wave.webp",
        icon: "✦",
        replies: [
          "呀，你来啦！今天也一起加油吧～",
          "There you are! Let’s make today a good one!",
        ],
      },
      {
        action: "think",
        pose: "think.webp",
        icon: "…",
        replies: ["唔……让我认真想一想。", "Hmm… let me think that through."],
      },
      {
        action: "cheer",
        pose: "cheer.webp",
        icon: "✧",
        replies: [
          "收到！给你充满能量的应援！",
          "You’ve got this! Sending you a little boost!",
        ],
      },
      {
        action: "comfort",
        pose: "comfort.webp",
        icon: "♡",
        replies: [
          "辛苦啦，给你一个暖暖的抱抱。",
          "You’ve done enough for now. Here’s a little warmth.",
        ],
      },
      {
        action: "beg",
        pose: "beg.webp",
        icon: "🥣",
        replies: [
          "我饿啦……可以给我一点饭饭吗？",
          "I’m hungry… could I have a little something to eat?",
        ],
      },
    ];
    var patReaction = {
      action: "pat",
      pose: "pat.webp",
      icon: "♡",
      replies: ["欸嘿，被摸摸头啦！", "Hehe, a head pat! That feels nice."],
    };

    function resetDeepseek() {
      activeReactionId += 1;
      window.clearTimeout(messageTimer);
      clearPress();
      stopIdleBlink();
      longPressTriggered = false;
      deepseekButton.classList.remove("is-reacting", "has-pose", "is-pressed");
      deepseekButton.removeAttribute("data-action");
      message.classList.remove("is-visible");
      message.textContent = "";
      if (reactionIcon) reactionIcon.textContent = "";
    }

    function stopIdleBlink() {
      window.clearTimeout(blinkTimer);
      window.clearTimeout(blinkEndTimer);
      blinkTimer = null;
      blinkEndTimer = null;
      deepseekButton.classList.remove("is-blinking");
    }

    function scheduleIdleBlink() {
      if (
        motionQuery.matches ||
        document.hidden ||
        document.documentElement.dataset.theme !== "light" ||
        deepseekButton.classList.contains("has-pose") ||
        deepseekButton.classList.contains("is-reacting") ||
        blinkTimer !== null ||
        blinkEndTimer !== null
      )
        return;

      blinkTimer = window.setTimeout(
        function () {
          blinkTimer = null;
          if (
            document.hidden ||
            document.documentElement.dataset.theme !== "light" ||
            deepseekButton.classList.contains("has-pose") ||
            deepseekButton.classList.contains("is-reacting")
          ) {
            scheduleIdleBlink();
            return;
          }

          deepseekButton.classList.add("is-blinking");
          blinkEndTimer = window.setTimeout(function () {
            blinkEndTimer = null;
            deepseekButton.classList.remove("is-blinking");
            scheduleIdleBlink();
          }, 130);
        },
        3900 + Math.floor(Math.random() * 2100),
      );
    }

    function showDeepseekPose(reactionId) {
      window.requestAnimationFrame(function () {
        if (
          reactionId === activeReactionId &&
          message.classList.contains("is-visible") &&
          !document.hidden &&
          document.documentElement.dataset.theme === "light"
        ) {
          deepseekButton.classList.add("has-pose", "is-reacting");
        }
      });
    }

    function playDeepseekReaction(reaction) {
      if (document.documentElement.dataset.theme !== "light") return;
      resetDeepseek();
      var reactionId = activeReactionId;
      var languageIndex = 1;
      deepseekButton.setAttribute("data-action", reaction.action);
      if (reactionIcon) reactionIcon.textContent = reaction.icon;
      message.textContent = reaction.replies[languageIndex];
      message.classList.add("is-visible");

      if (poseImage && reaction.pose) {
        poseImage.onload = function () {
          showDeepseekPose(reactionId);
        };
        poseImage.onerror = function () {
          if (reactionId === activeReactionId)
            deepseekButton.classList.add("is-reacting");
        };
        poseImage.src = poseSource(reaction.pose);
        if (poseImage.complete && poseImage.naturalWidth > 0)
          showDeepseekPose(reactionId);
      } else {
        showDeepseekPose(reactionId);
      }

      messageTimer = window.setTimeout(
        function () {
          resetDeepseek();
          scheduleIdleBlink();
        },
        reaction.action === "beg" ? 5200 : 3200,
      );
    }

    function clearPress() {
      window.clearTimeout(holdTimer);
      holdTimer = null;
      deepseekButton.classList.remove("is-pressed");
    }

    deepseekButton.addEventListener("pointerdown", function (event) {
      if (
        event.isPrimary === false ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      clearPress();
      longPressTriggered = false;
      preloadNextPose();
      preloadPose(patReaction.pose);
      deepseekButton.classList.add("is-pressed");
      holdTimer = window.setTimeout(function () {
        holdTimer = null;
        playDeepseekReaction(patReaction);
        longPressTriggered = true;
      }, 520);
    });

    deepseekButton.addEventListener("pointerup", clearPress);
    deepseekButton.addEventListener("pointerleave", clearPress);
    deepseekButton.addEventListener("pointercancel", function () {
      longPressTriggered = false;
      clearPress();
    });

    deepseekButton.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });

    deepseekButton.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    deepseekButton.addEventListener("pointerenter", preloadNextPose, {
      passive: true,
    });
    deepseekButton.addEventListener("focus", preloadNextPose);

    deepseekButton.addEventListener("click", function () {
      if (longPressTriggered) {
        longPressTriggered = false;
        return;
      }
      var reaction = reactions[reactionIndex++ % reactions.length];
      playDeepseekReaction(reaction);
    });

    document.addEventListener("site:themechange", function () {
      resetDeepseek();
      scheduleIdleBlink();
    });


    function poseSource(file) {
      return (
        poseBase.replace(/\/$/, "") +
        "/" +
        file +
        "?v=" +
        encodeURIComponent(poseVersion)
      );
    }

    function preloadPose(file) {
      if (!file || preloadedPoses[file]) return;
      var loader = new Image();
      loader.decoding = "async";
      loader.src = poseSource(file);
      preloadedPoses[file] = loader;
    }

    function preloadNextPose() {
      preloadPose(reactions[reactionIndex % reactions.length].pose);
    }

    function preload(file) {
      if (preloaded[file]) return;

      var loader = new Image();
      loader.decoding = "async";
      loader.src = source(file);
      preloaded[file] = loader;
    }

    function updateReducedMotion() {
      if (motionQuery.matches) stopIdleBlink();
      else scheduleIdleBlink();
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", updateReducedMotion);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(updateReducedMotion);
    }

    scheduleIdleBlink();
    window.setTimeout(function () {
      if (document.documentElement.dataset.theme === "light") preloadNextPose();
    }, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCompanion);
  } else {
    initCompanion();
  }
})();
