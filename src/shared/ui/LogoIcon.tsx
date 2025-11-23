import { cn } from '../lib/utils'

type LogoIconProps = {
  className?: string
  outerClassName?: string
  innerClassName?: string
}

export function LogoIcon({
  className = 'mr-2 h-8 w-8',
  outerClassName,
  innerClassName,
}: LogoIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoOuterGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--on-primary-container))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--on-primary-container))" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="logoInnerGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="0.7" />
        </linearGradient>
        <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.15" />
        </filter>
      </defs>
      <path
        d="M12 2.5L3.5 7.2V16.8L12 21.5L20.5 16.8V7.2L12 2.5Z"
        className={cn(outerClassName)}
        fill="url(#logoOuterGradient)"
        filter="url(#logoShadow)"
      />
      <path
        d="M10 8.5L16 12L10 15.5V8.5Z"
        className={cn(innerClassName)}
        fill="url(#logoInnerGradient)"
      />
    </svg>
  )
}
