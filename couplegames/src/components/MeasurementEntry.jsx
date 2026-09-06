import { useState } from 'react'

export function MeasurementEntry({ challenge, session, myRole, onSubmit, gramRoundIndex = null }) {
  const challengeId = challenge.id
  const measureKey = gramRoundIndex != null ? `${challengeId}_r${gramRoundIndex}` : String(challengeId)
  const existing = session.measurements[measureKey]?.[myRole]
  const [value, setValue] = useState(existing ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value === '') return
    onSubmit(measureKey, myRole, Number(value))
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[#463e34]">
      <label className="block text-sm text-[#c9beac] mb-2">
        {challenge.measure.label} ({challenge.measure.unit})
        {challenge.measure.target != null && !challenge.gramMaster && (
          <span className="text-[#8c8071]"> — target: {challenge.measure.target}{challenge.measure.unit}</span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 bg-[#2b2620] border border-[#463e34] rounded-sm px-3 py-2 text-[#f3ead9]"
          placeholder={`Enter ${challenge.measure.unit}`}
        />
        <button type="submit" className="bg-[#c96a4d] hover:bg-[#b85c40] text-[#221e1a] font-semibold px-4 rounded-sm">
          Submit
        </button>
      </div>
      {existing != null && (
        <p className="text-xs text-[#8c8071] mt-2">You submitted: {existing}{challenge.measure.unit}</p>
      )}
    </form>
  )
}
