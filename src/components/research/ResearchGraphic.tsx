interface ResearchGraphicProps {
  className?: string;
}

/** Decorative illustration, not a measured cardiac signal or a model result. */
export default function ResearchGraphic({ className = '' }: ResearchGraphicProps) {
  return (
    <svg viewBox="0 0 400 340" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="0.7" opacity="0.12">
        {[60, 100, 140, 180, 220, 260, 300, 340].map((x) => <path key={`x-${x}`} d={`M${x} 30V310`} />)}
        {[50, 90, 130, 170, 210, 250, 290].map((y) => <path key={`y-${y}`} d={`M40 ${y}H360`} />)}
      </g>
      <g stroke="currentColor">
        <circle cx="200" cy="170" r="126" strokeWidth="0.8" opacity="0.25" />
        <circle cx="200" cy="170" r="108" strokeDasharray="2 7" opacity="0.4" />
        <ellipse cx="200" cy="170" rx="145" ry="65" transform="rotate(-35 200 170)" opacity="0.45" />
        <ellipse cx="200" cy="170" rx="145" ry="65" transform="rotate(35 200 170)" opacity="0.2" />
        <circle cx="200" cy="170" r="75" fill="currentColor" fillOpacity="0.05" strokeOpacity="0.3" />
        <path d="M42 178H113L130 160L147 185L166 132L188 224L213 107L232 184L247 162L261 178H358" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M76 76H108M92 60V92M304 265H328M316 253V277" strokeWidth="1" opacity="0.6" />
      </g>
      <g fill="currentColor">
        <circle cx="96" cy="98" r="5" />
        <circle cx="305" cy="242" r="5" />
        <circle cx="267" cy="63" r="3" opacity="0.5" />
        <circle cx="119" cy="265" r="3" opacity="0.5" />
        <circle cx="200" cy="44" r="2" />
        <circle cx="200" cy="296" r="2" />
        <circle cx="54" cy="170" r="2" opacity="0.5" />
        <circle cx="346" cy="170" r="2" opacity="0.5" />
      </g>
    </svg>
  );
}
