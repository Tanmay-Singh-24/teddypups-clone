/**
 * How far (ms) the first-load intro curtain has got: the time on its zero-length `tp-curtain-rest`
 * animation, which ends when the intro does. Infinity once it has finished.
 */
export function introTime() {
  const rest = document
    .querySelector(".tp-curtain")
    ?.getAnimations()
    .find((a) => (a as CSSAnimation).animationName === "tp-curtain-rest");
  return rest && rest.playState !== "finished" && typeof rest.currentTime === "number" ? rest.currentTime : Infinity;
}

/**
 * True while the page curtain covers the page, so entrance animations wait for it to lift (it
 * announces that with a `tp:arrived` event).
 */
export function curtainDown() {
  const state = document.querySelector<HTMLElement>(".tp-curtain")?.dataset.state;
  return (state === "intro" && introTime() < 560) || state === "covering" || state === "covered" || state === "snap";
}
