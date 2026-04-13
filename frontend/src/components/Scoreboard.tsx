import { PlayerPublic, WinnerSummary } from "@shared/game";

interface ScoreboardProps {
  players: PlayerPublic[];
  winners?: WinnerSummary[];
  isPlaying: boolean;
}

export function Scoreboard({ players, winners, isPlaying }: ScoreboardProps) {
  const listing = winners ?? players;

  return (
    <aside className="panel h-fit p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-parchment">Marcador</h3>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gold/80">
          {isPlaying ? "En vivo" : "Sala"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {listing.map((player, index) => (
          <div key={player.id} className="rounded-[1.5rem] border border-white/10 bg-black/15 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-mist/50">#{index + 1}</p>
                <p className="font-semibold text-parchment">
                  {player.name}
                  {"isHost" in player && player.isHost ? (
                    <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Anfitrion</span>
                  ) : null}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/60">Pts</p>
                <p className="text-xl font-semibold text-gold">{player.score}</p>
              </div>
            </div>
            {"answeredCurrentStage" in player && isPlaying ? (
              <p className="mt-2 text-sm text-mist/75">
                {player.answeredCurrentStage ? "Jugada lista" : "Pensando..."}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
