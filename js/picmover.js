function initMarqueeSteadyLeft() {
  // find every marquee container on the page
  document.querySelectorAll("[data-marquee-scroll-direction-target]").forEach((marquee) => {

    // the original band of images (the "tape")
    const marqueeContent = marquee.querySelector("[data-marquee-collection-target]");
    // the wide track that holds all bands side by side
    const marqueeScroll  = marquee.querySelector("[data-marquee-scroll-target]");
    // bail out if either element is missing
    if (!marqueeContent || !marqueeScroll) return;

    // read config from data attributes on the container
    const baseSpeed       = parseFloat(marquee.dataset.marqueeSpeed) || 20;
    let   duplicateAmount = parseInt(marquee.dataset.marqueeDuplicate || "1", 10);
    if (duplicateAmount < 1) duplicateAmount = 1;

    // clone the band N times and append to the track so the loop is seamless
    const frag = document.createDocumentFragment();
    for (let i = 0; i < duplicateAmount; i++) {
      frag.appendChild(marqueeContent.cloneNode(true)); // deep clone = copies all children too
    }
    marqueeScroll.appendChild(frag);

    // now select all bands (original + clones) — GSAP animates them all together
    const marqueeItems = marquee.querySelectorAll("[data-marquee-collection-target]");

    // slow down on smaller screens so it doesn't feel too fast
    const speedMultiplier =
      window.innerWidth < 479 ? 0.25 :
      window.innerWidth < 991 ? 0.5  : 1;

    const calcDuration = () => {
      const w   = marqueeContent.offsetWidth || 1;
      // duration scales with how wide the band is relative to the screen
      // wider band = longer duration = same apparent pixel speed
      const dur = baseSpeed * (w / Math.max(window.innerWidth, 1)) * speedMultiplier;
      // right-direction travels 200% (-100 to +100) vs 100% for left, so double the duration
      const distance = marquee.dataset.marqueeDirection === "right" ? 2 : 1;
      return (dur > 0 ? dur : baseSpeed) * distance;
    };

    // set starting position: left-moving starts at 0, right-moving starts off-screen to the left
    gsap.set(marqueeItems, { xPercent: marquee.dataset.marqueeDirection === "right" ? -100 : 0 });

    // animate all bands simultaneously:
    // left:  0% → -100% (slides off to the left, clone is already waiting on the right)
    // right: -100% → +100% (slides in from the left, off to the right)
    // repeat: -1 = loop forever, ease: none = constant speed (no acceleration)
    const tween = gsap.to(marqueeItems, {
      xPercent: marquee.dataset.marqueeDirection === "right" ? 100 : -100,
      duration: calcDuration(),
      repeat: -1,
      ease: "none",
    });

    // recalculate duration on resize so pixel speed stays consistent at any window size
    let resizeRAF = null;
    window.addEventListener("resize", () => {
      if (resizeRAF) cancelAnimationFrame(resizeRAF); // debounce: cancel previous frame if resize fires rapidly
      resizeRAF = requestAnimationFrame(() => tween.duration(calcDuration()));
    });
  });
}

document.addEventListener("DOMContentLoaded", initMarqueeSteadyLeft);