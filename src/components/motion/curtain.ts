/**
 * True while the page curtain (P6b) covers the page, so entrance animations wait for it to lift
 * (it announces that with a `tp:arrived` event). Until the curtain exists this is always false.
 */
export function curtainDown() {
  const state = document.querySelector<HTMLElement>(".tp-curtain")?.dataset.state;
  return (state === "intro" && performance.now() < 560) || state === "covering" || state === "covered" || state === "snap";
}
