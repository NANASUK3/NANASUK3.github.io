# DeepSeek daylight companion

`idle.webp` is a transparent 320 × 332 WebP prepared from the supplied chibi maid reference image. The white background was removed and the artwork was cropped with a small transparent margin for the homepage pet.

The sprite keeps the supplied character's original colors and proportions while using transparency around the silhouette so it can sit cleanly over the homepage background.

`poses/` contains transparent WebP pose variants for the light-theme companion: `wave.webp`, `think.webp`, `cheer.webp`, `comfort.webp`, `pat.webp`, `beg.webp`, and `blink.webp`. Click reactions fade into the matching pose and add a small motion cue. `beg.webp` shows her sitting behind a bowl and tapping it with both hands to ask for food. The blink frame is clipped to the eye area so the idle body stays in place while she blinks. Idle breathing and blinking stop when reduced motion is requested.

The first character click plays the bowl reaction. The adjacent Bowl / 敲碗 button can replay it directly. Its motion repeats three times and the pose remains visible for 5.2 seconds; reduced motion keeps the seated pose static.
