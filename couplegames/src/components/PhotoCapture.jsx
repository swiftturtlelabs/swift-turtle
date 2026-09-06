import { useRef } from 'react'

export function PhotoCapture({ challenge, session, myRole, photos, onUpload, blindReveal }) {
  const inputRef = useRef(null)
  const challengeId = challenge.id
  const count = challenge.photo?.count || 1
  const colors = challenge.photo?.colors

  const myPhotos = (session.photoMeta[String(challengeId)]?.[myRole] || [])
  const partnerKey = myRole === 'player1' ? 'player2' : 'player1'
  const partnerPhotos = (session.photoMeta[String(challengeId)]?.[partnerKey] || [])
  const bothSubmitted = myPhotos.length >= count && partnerPhotos.length >= count
  const hidePartner = blindReveal && !bothSubmitted

  const handleFile = async (e, slot = 0) => {
    const file = e.target.files?.[0]
    if (!file) return
    await onUpload(challengeId, file, slot)
    e.target.value = ''
  }

  const slots = colors
    ? colors.map((color, i) => ({ label: color, slot: i }))
    : Array.from({ length: count }, (_, i) => ({ label: `Photo ${i + 1}`, slot: i }))

  return (
    <div className="mt-4 pt-4 border-t border-[#463e34]">
      <div className="text-xs text-[#8c8071] mb-3 uppercase tracking-wide">Photos</div>
      <div className="space-y-3">
        {slots.map(({ label, slot }) => {
          const mine = myPhotos.find((p) => p.slot === slot)
          const theirs = partnerPhotos.find((p) => p.slot === slot)
          return (
            <div key={slot} className="border border-[#463e34] rounded-sm p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">{label}</span>
                {!mine && (
                  <>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id={`photo-${challengeId}-${slot}`}
                      onChange={(e) => handleFile(e, slot)}
                    />
                    <label
                      htmlFor={`photo-${challengeId}-${slot}`}
                      className="text-xs bg-[#c96a4d] text-[#221e1a] px-3 py-1 rounded-sm cursor-pointer font-semibold"
                    >
                      Add photo
                    </label>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {mine && (
                  <div>
                    <div className="text-xs text-[#8c8071] mb-1">Yours</div>
                    <img src={mine.url} alt={label} className="w-full rounded-sm aspect-square object-cover" />
                  </div>
                )}
                {theirs && (
                  <div>
                    <div className="text-xs text-[#8c8071] mb-1">Partner</div>
                    {hidePartner ? (
                      <div className="w-full aspect-square bg-[#2b2620] rounded-sm flex items-center justify-center text-[#8c8071] text-sm">
                        Hidden until both submit
                      </div>
                    ) : (
                      <img src={theirs.url} alt={`Partner ${label}`} className="w-full rounded-sm aspect-square object-cover" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {blindReveal && !bothSubmitted && partnerPhotos.length > 0 && (
        <p className="text-xs text-[#8c8071] mt-2 italic">Partner photo hidden until you both submit.</p>
      )}
    </div>
  )
}
