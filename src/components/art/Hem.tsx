// The scalloped, stitched hem that hangs under the header bar once it has a background.
export function Hem() {
  return (
    <svg aria-hidden="true" className="tp-header__hem" width="100%" height="14" preserveAspectRatio="none">
      <defs>
        <pattern id="tp-hem" width="44" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0H44V2A22 11 0 0 1 0 2Z" className="tp-header__hem-fill" />
          <path d="M0 2A22 11 0 0 0 44 2" className="tp-header__hem-line" />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill="url(#tp-hem)" />
    </svg>
  );
}
