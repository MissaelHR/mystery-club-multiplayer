import { useEffect, useState } from "react";
import {
  DIFFICULTY_OPTIONS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  MiniGameType,
  PlayerPublic,
  RoomState,
} from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onConfigure: (difficulty: (typeof DIFFICULTY_OPTIONS)[number]["id"], playlist: MiniGameType[]) => void;
  onStart: () => void;
  onEnd: () => void;
  onKick: (targetPlayerId: string) => void;
}

export function LobbyScreen({ room, me, onConfigure, onStart, onEnd, onKick }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && room.configuredMiniGames.length > 0 && Boolean(me?.isHost);
  const [draftDifficulty, setDraftDifficulty] = useState(room.selectedDifficulty);
  const [draftPlaylist, setDraftPlaylist] = useState<MiniGameType[]>(room.configuredMiniGames);

  useEffect(() => {
    setDraftDifficulty(room.selectedDifficulty);
    setDraftPlaylist(room.configuredMiniGames);
  }, [room.selectedDifficulty, room.configuredMiniGames]);

  const toggleMiniGame = (miniGameId: MiniGameType) => {
    setDraftPlaylist((current) =>
      current.includes(miniGameId) ? current.filter((item) => item !== miniGameId) : [...current, miniGameId],
    );
  };

  const moveMiniGame = (index: number, direction: -1 | 1) => {
    setDraftPlaylist((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const applyConfig = () => {
    onConfigure(draftDifficulty, draftPlaylist);
  };

  return (
    <section className="panel-strong overflow-hidden p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold/75">Sala {room.code}</p>
          <h2 className="mt-2 font-display text-4xl text-parchment md:text-5xl">{room.gameTitle}</h2>
          <p className="mt-2 max-w-2xl text-mist/80">{room.gameSubtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Dificultad</p>
            <p className="mt-1 text-xl font-semibold text-parchment capitalize">{room.selectedDifficulty}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Equipo</p>
            <p className="mt-1 text-xl font-semibold text-parchment">
              {room.players.length}/{MAX_PLAYERS}
            </p>
          </div>
        </div>
      </div>

      {me?.isHost ? (
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/75">Paso 1 · Dificultad</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {room.availableDifficulties.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDraftDifficulty(option.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    option.id === draftDifficulty
                      ? "border-gold/50 bg-gold/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70">{option.badge}</p>
                  <p className="mt-2 font-display text-2xl text-parchment">{option.title}</p>
                  <p className="mt-2 text-sm leading-6 text-mist/75">{option.summary}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/75">Paso 2 · Orden de la mision</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {room.availableMiniGames.map((miniGame) => {
                const selectedIndex = draftPlaylist.indexOf(miniGame.id);
                const active = selectedIndex >= 0;
                return (
                  <button
                    key={miniGame.id}
                    type="button"
                    onClick={() => toggleMiniGame(miniGame.id)}
                    className={`rounded-3xl border bg-gradient-to-br p-5 text-left transition ${miniGame.accent} ${
                      active ? "border-gold/50 shadow-glow" : "border-white/10 opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-mist/60">{miniGame.id}</p>
                        <p className="mt-2 font-display text-3xl text-parchment">{miniGame.title}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.25em] text-gold">
                        {active ? `#${selectedIndex + 1}` : "Libre"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-mist/80">{miniGame.summary}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-mist/75">Secuencia actual</p>
                <button
                  type="button"
                  onClick={applyConfig}
                  className="rounded-2xl bg-gold px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  Guardar mision
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {draftPlaylist.map((miniGameId, index) => {
                  const miniGame = room.availableMiniGames.find((item) => item.id === miniGameId)!;
                  return (
                    <div key={miniGameId} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-mist/55">Ronda {index + 1}</p>
                        <p className="mt-1 font-semibold text-parchment">{miniGame.title}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveMiniGame(index, -1)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-mist/80"
                        >
                          Subir
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMiniGame(index, 1)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-mist/80"
                        >
                          Bajar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-mist/75">El anfitrion esta preparando la secuencia de minijuegos.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {room.configuredMiniGames.map((miniGameId, index) => {
              const miniGame = room.availableMiniGames.find((item) => item.id === miniGameId)!;
              return (
                <div key={miniGameId} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Ronda {index + 1}</p>
                  <p className="mt-2 font-display text-2xl text-parchment">{miniGame.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {room.players.map((player) => (
          <div key={player.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">
                  {player.name}
                  {player.isHost ? <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Anfitrion</span> : null}
                </p>
                <p className="mt-1 text-sm text-mist/65">{player.connected ? "Listo para jugar" : "Desconectado"}</p>
              </div>
              {me?.isHost && !player.isHost ? (
                <button
                  type="button"
                  onClick={() => onKick(player.id)}
                  className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100"
                >
                  Sacar
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {me?.isHost ? (
          <>
            <button
              onClick={onStart}
              disabled={!canStart}
              className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Lanzar mision
            </button>
            <button
              onClick={onEnd}
              className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-6 py-3 font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Finalizar
            </button>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
            Esperando al anfitrion
          </div>
        )}
        {!canStart ? <p className="text-sm text-mist/70">Configura la mision y suma al menos 2 jugadores.</p> : null}
      </div>
    </section>
  );
}
