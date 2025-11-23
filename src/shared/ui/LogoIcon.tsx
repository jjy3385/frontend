export function LogoIcon({ className = 'mr-2 h-8 w-8' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2.5L3.5 7.2V16.8L12 21.5L20.5 16.8V7.2L12 2.5Z"
        className="fill-foreground"
      />
      <path d="M10 8.5L16 12L10 15.5V8.5Z" className="fill-background" />
    </svg>
  )
}
