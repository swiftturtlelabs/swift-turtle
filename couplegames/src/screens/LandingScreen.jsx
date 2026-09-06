import { ScreenShell, Card, PrimaryButton, SecondaryButton } from '../components/Layout.jsx'
import { AppTitle } from '../components/AppTitle.jsx'

export function LandingScreen({ isFirebaseConfigured, onSingleDevice, onCreateGame, onJoinGame }) {
  return (
    <ScreenShell>
      <div className="text-center">
        <AppTitle className="font-display text-4xl md:text-5xl font-semibold mb-3 md:mb-4 tracking-tight cursor-default select-none">
          Couple's Challenge
        </AppTitle>
        <p className="text-lg md:text-xl text-[#c9beac] mb-5 md:mb-6">10 challenges. Two halves. One winner.</p>

        <Card className="mb-5 md:mb-6 text-left">
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-3 md:mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="border-l-2 border-[#c96a4d] pl-4">
              <h3 className="text-base md:text-lg font-semibold text-[#e08a68] mb-1">1st Half: At Home (5)</h3>
              <p className="text-sm md:text-base text-[#c9beac]">Precision, estimation, and creativity — no need to leave the house.</p>
            </div>
            <div className="border-l-2 border-[#4d9a94] pl-4">
              <h3 className="text-base md:text-lg font-semibold text-[#6bbdb6] mb-1">2nd Half: Out on the Town (5)</h3>
              <p className="text-sm md:text-base text-[#c9beac]">Head out for hunting and searching around stores.</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {isFirebaseConfigured && (
            <>
              <PrimaryButton className="w-full text-lg" onClick={onCreateGame}>
                Start a game (two phones)
              </PrimaryButton>
              <SecondaryButton className="w-full text-lg" onClick={onJoinGame}>
                Join with code
              </SecondaryButton>
            </>
          )}
          <SecondaryButton className="w-full text-lg" onClick={onSingleDevice}>
            Play on one phone
          </SecondaryButton>
        </div>
      </div>
    </ScreenShell>
  )
}
