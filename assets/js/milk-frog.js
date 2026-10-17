(function () {
  "use strict";

  function initMilkFrog() {
    var pet = document.querySelector("[data-milk-frog-pet]");
    if (!pet) return;

    var button = pet.querySelector(".milk-frog-pet__button");
    var image = pet.querySelector(".milk-frog-pet__image");
    if (!button || !image) return;

    var base = pet.getAttribute("data-asset-base") || "/images/milk-frog/";
    var assetVersion =
      pet.getAttribute("data-asset-version") || "20261004-full60";
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var idleFile = "idle-0.webp";
    var laughFile = motionQuery.matches ? "laugh-0.webp" : "laugh-60.webp";
    var animationTimer = null;
    var frameTimer = null;
    var preloaded = Object.create(null);
    var animationId = 0;
    var frogMessage = pet.querySelector(".milk-frog-pet__message");
    var frogMessageTimer = null;
    var frogMessageLines = null;
    var frogHoldTimer = null;
    var frogLongPressTriggered = false;
    var frogTapStreak = 0;
    var frogTapStreakTimer = null;
    var greetFiles = [
      "greet-0.webp",
      "greet-1.webp",
      "greet-2.webp",
      "greet-3.webp",
      "greet-4.webp",
    ];
    var frogGreetings = [
      [
        "咦，你来啦！奶蛙挥手报到～",
        "Oh, you’re here! Milk frog reporting for duty!",
      ],
      ["嗨，今天也要对自己好一点。", "Hi! Be a little kind to yourself today."],
      [
        "奶蛙已上线，给你递上一点好心情。",
        "Milk frog is online, bringing you a little good mood.",
      ],
    ];
    var frogLaughReplies = [
      ["哈哈哈哈，被你点醒啦！", "Hahaha, you woke me up!"],
      ["这一下笑得很有精神～", "That laugh had some serious energy!"],
      [
        "再来一下？奶蛙还没笑够呢！",
        "One more? Milk frog is not done laughing yet!",
      ],
    ];
    var frogComboReply = [
      "连续三次！你发现了奶蛙的笑点～",
      "Three taps in a row! You found milk frog’s funny bone.",
    ];
    var frogWorkingReply = [
      "嘘……奶蛙正在认真工作，摸鱼稍后再说。",
      "Shh… milk frog is working hard. We can idle later.",
    ];
    var deepseekButton = pet.querySelector(".deepseek-pet__button");
    var poseImage = pet.querySelector(".deepseek-pet__pose");
    var message = pet.querySelector(".deepseek-pet__message");
    var reactionIcon = pet.querySelector(".deepseek-pet__reaction-icon");
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

    function frogLanguageIndex() {
      return document.documentElement.classList.contains("lang-zh") ? 0 : 1;
    }

    function frogText(lines) {
      return lines[frogLanguageIndex()] || lines[0];
    }

    function clearFrogMessage() {
      window.clearTimeout(frogMessageTimer);
      frogMessageTimer = null;
      frogMessageLines = null;
      if (!frogMessage) return;
      frogMessage.classList.remove("is-visible");
      frogMessage.textContent = "";
    }

    function showFrogMessage(lines, duration) {
      if (!frogMessage) return;
      window.clearTimeout(frogMessageTimer);
      frogMessageLines = lines;
      frogMessage.textContent = frogText(lines);
      frogMessage.classList.add("is-visible");
      frogMessageTimer = window.setTimeout(clearFrogMessage, duration);
    }

    function cancelFrogAction() {
      window.clearTimeout(animationTimer);
      window.clearTimeout(frameTimer);
      window.clearTimeout(frogHoldTimer);
      animationTimer = null;
      frameTimer = null;
      frogHoldTimer = null;
      frogLongPressTriggered = false;
      animationId += 1;
      button.classList.remove(
        "is-greeting",
        "is-laughing",
        "is-working",
        "is-pressed",
      );
      showIdle();
      clearFrogMessage();
    }

    function finishFrogAction(actionId) {
      if (actionId !== animationId) return;
      window.clearTimeout(animationTimer);
      window.clearTimeout(frameTimer);
      animationTimer = null;
      frameTimer = null;
      button.classList.remove(
        "is-greeting",
        "is-laughing",
        "is-working",
        "is-pressed",
      );
      showIdle();
    }

    function playFrogFrames(
      files,
      className,
      lines,
      frameDelay,
      endDelay,
      messageDuration,
    ) {
      cancelFrogAction();
      var actionId = animationId;
      button.classList.add(className);
      showFrogMessage(lines, messageDuration);
      files.forEach(preload);

      var frameIndex = 0;
      function showNextFrame() {
        if (actionId !== animationId) return;
        image.src = source(files[frameIndex]);
        frameIndex += 1;
        if (frameIndex < files.length) {
          frameTimer = window.setTimeout(showNextFrame, frameDelay);
        } else {
          frameTimer = null;
          animationTimer = window.setTimeout(function () {
            finishFrogAction(actionId);
          }, endDelay);
        }
      }
      showNextFrame();
    }

    function playFrogGreeting() {
      if (document.documentElement.dataset.theme !== "dark") return;
      var lines =
        frogGreetings[Math.floor(Math.random() * frogGreetings.length)];
      var files = motionQuery.matches
        ? [greetFiles[greetFiles.length - 1]]
        : greetFiles;
      playFrogFrames(
        files,
        "is-greeting",
        lines,
        motionQuery.matches ? 0 : 105,
        360,
        2400,
      );
    }

    function playFrogWorking() {
      if (document.documentElement.dataset.theme !== "dark") return;
      cancelFrogAction();
      var actionId = animationId;
      button.classList.add("is-working");
      showFrogMessage(frogWorkingReply, 2550);
      preload("working-0.webp");
      image.src = source("working-0.webp");
      animationTimer = window.setTimeout(function () {
        finishFrogAction(actionId);
      }, 2200);
    }

    function recordFrogTap() {
      frogTapStreak += 1;
      window.clearTimeout(frogTapStreakTimer);
      frogTapStreakTimer = window.setTimeout(function () {
        frogTapStreak = 0;
        frogTapStreakTimer = null;
      }, 2600);
      if (frogTapStreak >= 3) {
        frogTapStreak = 0;
        window.clearTimeout(frogTapStreakTimer);
        frogTapStreakTimer = null;
        return true;
      }
      return false;
    }

    function playFrogLaugh() {
      if (document.documentElement.dataset.theme !== "dark") return;
      var isCombo = recordFrogTap();
      var lines = isCombo
        ? frogComboReply
        : frogLaughReplies[Math.floor(Math.random() * frogLaughReplies.length)];
      var duration = motionQuery.matches ? 850 : 1000;

      cancelFrogAction();
      var actionId = animationId;
      button.classList.add("is-laughing");
      showFrogMessage(lines, duration + 650);
      preload(laughFile);

      /* Reset first so a second click restarts the animated WebP reliably. */
      image.src = source(idleFile);
      window.requestAnimationFrame(function () {
        if (actionId !== animationId) return;
        image.src = source(laughFile);
      });

      animationTimer = window.setTimeout(function () {
        finishFrogAction(actionId);
      }, duration);
    }

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
      var languageIndex = document.documentElement.classList.contains("lang-zh")
        ? 0
        : 1;
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

    function clearFrogPress() {
      window.clearTimeout(frogHoldTimer);
      frogHoldTimer = null;
      button.classList.remove("is-pressed");
    }

    button.addEventListener("pointerdown", function (event) {
      if (
        event.isPrimary === false ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      clearFrogPress();
      frogLongPressTriggered = false;
      preloadLaugh();
      preload("working-0.webp");
      button.classList.add("is-pressed");
      frogHoldTimer = window.setTimeout(function () {
        frogHoldTimer = null;
        playFrogWorking();
        frogLongPressTriggered = true;
      }, 560);
    });

    button.addEventListener("pointerup", clearFrogPress);
    button.addEventListener("pointerleave", clearFrogPress);
    button.addEventListener("pointercancel", function () {
      frogLongPressTriggered = false;
      clearFrogPress();
    });

    button.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });

    button.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });

    button.addEventListener("pointerenter", preloadLaugh, { passive: true });
    button.addEventListener("focus", preloadLaugh);

    button.addEventListener("click", function () {
      if (frogLongPressTriggered) {
        frogLongPressTriggered = false;
        return;
      }
      playFrogLaugh();
    });

    document.addEventListener("site:themechange", function () {
      stopAnimation();
      resetDeepseek();
      scheduleIdleBlink();
      warmLaughAsset();
      if (document.documentElement.dataset.theme === "dark") {
        window.setTimeout(playFrogGreeting, 180);
      }
    });

    document.addEventListener("site:layoutchange", function () {
      if (
        frogMessage &&
        frogMessage.classList.contains("is-visible") &&
        frogMessageLines
      ) {
        frogMessage.textContent = frogText(frogMessageLines);
      }
    });

    function source(file) {
      return (
        base.replace(/\/$/, "") +
        "/" +
        file +
        "?v=" +
        encodeURIComponent(assetVersion)
      );
    }

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

    function showIdle() {
      image.src = source(idleFile);
    }

    function stopAnimation() {
      cancelFrogAction();
    }

    function preloadLaugh() {
      preload(motionQuery.matches ? "laugh-0.webp" : "laugh-60.webp");
    }

    function warmLaughAsset() {
      if (document.documentElement.dataset.theme !== "dark") return;
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(preloadLaugh, { timeout: 1200 });
      } else {
        window.setTimeout(preloadLaugh, 240);
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAnimation();
        resetDeepseek();
      } else {
        scheduleIdleBlink();
      }
    });

    function updateReducedMotion() {
      laughFile = motionQuery.matches ? "laugh-0.webp" : "laugh-60.webp";
      stopAnimation();
      if (motionQuery.matches) {
        stopIdleBlink();
      } else {
        scheduleIdleBlink();
      }
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", updateReducedMotion);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(updateReducedMotion);
    }

    // Keep the first paint static and warm the click asset while the page is idle.
    showIdle();
    warmLaughAsset();
    scheduleIdleBlink();
    if (document.documentElement.dataset.theme === "dark") {
      window.setTimeout(playFrogGreeting, 180);
    }
    window.setTimeout(function () {
      if (document.documentElement.dataset.theme === "light") preloadNextPose();
    }, 1600);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMilkFrog);
  } else {
    initMilkFrog();
  }
})();
