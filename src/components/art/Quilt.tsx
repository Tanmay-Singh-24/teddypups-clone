// The quilted band with its scalloped, stitched top edge (hero, and the page curtain in P6b).

type QuiltProps = {
  /** Pattern id; must be unique on the page. */
  id?: string;
  className?: string;
};

export function QuiltEdge({ id = "tp-scallop", className = "tp-quilt__edge" }: QuiltProps) {
  return (
    <svg className={className} width="100%" height="40" preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="76" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40V27A38 25 0 0 1 76 27V40Z" style={{ fill: "var(--quilt)" }} />
          <path d="M0 27A38 25 0 0 1 76 27" fill="none" stroke="#2a170e" strokeWidth="3" />
          <path
            d="M11 33A27 19 0 0 1 65 33"
            fill="none"
            stroke="#2a170e"
            strokeWidth="1.6"
            strokeDasharray="3.5 5.5"
            strokeLinecap="round"
            opacity=".42"
          />
        </pattern>
      </defs>
      <rect width="100%" height="40" fill={`url(#${id})`} />
    </svg>
  );
}

export function Quilt({ id }: { id?: string }) {
  return (
    <div aria-hidden="true" className="tp-quilt">
      <QuiltEdge id={id} />
    </div>
  );
}
