import { PLAYER_COLOR_OPTIONS } from '../playerColors.js'

export function ColorSwatch({ color, size = 'md', className = '' }) {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <span
      className={`inline-block rounded-full border border-[#463e34] shrink-0 ${sizeClass} ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}

export function ColorPicker({ value, onChange, label }) {
  return (
    <div>
      {label && <div className="text-xs text-[#8c8071] mb-2">{label}</div>}
      <div className="flex flex-wrap gap-2 items-center">
        {PLAYER_COLOR_OPTIONS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${value === color ? 'scale-110 border-[#f3ead9]' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            aria-pressed={value === color}
          />
        ))}
        <label className="relative w-8 h-8 rounded-full border border-[#463e34] overflow-hidden cursor-pointer" title="Custom color">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <span
            className="block w-full h-full"
            style={{
              background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            }}
          />
        </label>
      </div>
    </div>
  )
}

export function PlayerLabel({ player, showSwatch = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${className}`} style={{ color: player.color }}>
      {showSwatch && <ColorSwatch color={player.color} size="sm" />}
      {player.name}
    </span>
  )
}

export function PlayerOptionButton({ player, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-3 rounded-sm border flex items-center justify-center gap-2 transition-colors ${selected ? '' : 'border-[#463e34]'}`}
      style={selected ? { borderColor: player.color, backgroundColor: `${player.color}22` } : undefined}
    >
      <ColorSwatch color={player.color} />
      <span style={{ color: player.color }}>{player.name}</span>
    </button>
  )
}
