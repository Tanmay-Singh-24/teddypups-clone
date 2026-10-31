// The woven basket Teddy curls up in. Two layers so the pup sits between the back rim and the front.
export function BasketBack() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 240" className="tp-basket__back">
      <ellipse cx="212" cy="145" rx="96" ry="12" className="tp-basket__hollow" />
      <path d="M116 145 A96 12 0 0 1 308 145" className="tp-basket__rim-line" />
      <path d="M116 145 A96 12 0 0 1 308 145" className="tp-basket__rim" />
    </svg>
  );
}

export function BasketFront() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 240" className="tp-basket__front">
      <path d="M116 145 C118 180 126 214 138 232 L286 232 C298 214 306 180 308 145 A96 12 0 0 1 116 145 Z" className="tp-basket__body" />
      <path d="M121 178 Q212 197 303 178 M127 206 Q212 223 297 206" className="tp-basket__weave" />
      <path
        d="M150 164 L158 230 M182 168 L185 232 M212 169 V232 M242 168 L239 232 M274 164 L266 230"
        className="tp-basket__weave tp-basket__weave--stakes"
      />
      <path d="M116 145 A96 12 0 0 0 308 145" className="tp-basket__rim-line" />
      <path d="M116 145 A96 12 0 0 0 308 145" className="tp-basket__rim" />
    </svg>
  );
}
