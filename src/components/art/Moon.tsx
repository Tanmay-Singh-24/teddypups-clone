// A crescent moon: a circle whose inset shadow paints the lit sliver.
export function Moon({ className = "" }: { className?: string }) {
  return <span className={`tp-moon ${className}`.trim()} />;
}
