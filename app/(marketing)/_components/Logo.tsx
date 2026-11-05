export function LogoMark({className = 'ms-logo-mark'}: {className?: string}) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 22.5 16 8l12 14.5H4Z" fill="#F5BE29" />
      <path d="M6.5 24.5 16 13l9.5 11.5h-19Z" fill="#C5CAD3" />
      <path d="M9 26.5 16 18l7 8.5H9Z" fill="#112B3D" />
      <path d="M12 28 16 23l4 5h-8Z" fill="#6B7280" />
    </svg>
  );
}

export function Logo({href = '/'}: {href?: string}) {
  return (
    <a className="ms-logo" href={href} aria-label="MESA home">
      <LogoMark />
      <span>MESA</span>
    </a>
  );
}
