export function ScreenShell({ children, className = '', footer = null }) {
  return (
    <div className={`h-screen overflow-y-auto bg-[#221e1a] text-[#f3ead9] flex flex-col items-center justify-start pt-6 md:pt-8 p-4 md:p-8 pb-4 ${className}`}>
      <div className="max-w-2xl w-full flex-1 min-h-0">{children}</div>
      {footer}
    </div>
  )
}

export function Card({ children, className = '', compact = false }) {
  return (
    <div className={`border border-[#463e34] rounded-sm ${compact ? 'p-3' : 'p-5 md:p-6'} ${className}`}>{children}</div>
  )
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-bold py-3 md:py-4 px-6 md:px-8 rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`border border-[#463e34] hover:border-[#c9beac] text-[#c9beac] hover:text-[#f3ead9] font-semibold py-2 md:py-3 px-4 md:px-6 rounded-sm transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
