import { PlayerPublic, PlayerRoundResult, WinnerSummary } from "@shared/game";

interface ScoreboardProps {
  players: PlayerPublic[];
  revealResults?: PlayerRoundResult[];
  winners?: WinnerSummary[];
}

export function Scoreboard({ players, revealResults, winners }: ScoreboardProps) {
  const bonusLookup = new Map(revealResults?.map((item) => [item.playerId, item]) ?? []);
  const listing = winners ?? players;

  return (
    <aside className="panel h-fit p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-parchment">Marcador</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gold/80">
          En vivo
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {listing.map((player, index) => {
          const reveal = bonusLookup.get(player.id);
          return (
            <div key={player.id} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist/50">#{index + 1}</p>
                  <p className="font-semibold text-parchment">
                    {player.name}
                    {"isHost" in player && player.isHost ? (
                      <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Anfitrión</span>
                    ) : null}
                  </p>
                </div>
                <p className="text-xl font-semibold text-gold">{player.score}</p>
              </div>
              {reveal ? (
                <p className="mt-2 text-sm text-mist/75">
                  {reveal.isCorrect ? `+${reveal.pointsEarned} en esta ronda` : "Sin puntos en esta ronda"}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
