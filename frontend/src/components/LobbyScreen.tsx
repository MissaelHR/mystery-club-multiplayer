import { MAX_PLAYERS, MIN_PLAYERS, PlayerPublic, RoomState } from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onConfigure: (challengeId: string) => void;
  onStart: () => void;
}

const challengeTypeLabel = {
  "pista-relampago": "Pista relámpago",
  "memoria-flash": "Memoria flash",
  "decision-secreta": "Decisión secreta",
};

export function LobbyScreen({ room, me, onConfigure, onStart }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && Boolean(me?.isHost);
  const selectedChapter = room.selectedChallenge?.chapterNumber ?? 20;
  const chapterNumbers = [...new Set(room.availableChallenges.map((item) => item.chapterNumber))];
  const chapterChallenges = room.availableChallenges.filter((item) => item.chapterNumber === selectedChapter);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="panel-strong p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Sala privada</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h2 className="font-display text-4xl text-parchment">Sala {room.code}</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/75">
            {room.players.length}/{MAX_PLAYERS} detectives
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-mist/80">
          Reúne a tu equipo, comparte el código de la sala y empieza cuando se hayan unido al menos{" "}
          {MIN_PLAYERS} jugadores.
        </p>

        <div className="mt-8 rounded-3xl border border-gold/20 bg-black/20 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/75">Panel del anfitrión</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
            <div>
              <label className="block text-sm text-mist/75">Capítulo</label>
              <select
                value={selectedChapter}
                onChange={(event) => {
                  const nextChapter = Number(event.target.value);
                  const firstChallenge = room.availableChallenges.find((item) => item.chapterNumber === nextChapter);
                  if (firstChallenge && me?.isHost) {
                    onConfigure(firstChallenge.id);
                  }
                }}
                disabled={!me?.isHost}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none disabled:opacity-60"
              >
                {chapterNumbers.map((chapterNumber) => (
                  <option key={chapterNumber} value={chapterNumber}>
                    Capítulo {chapterNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm text-mist/75">Minijuegos disponibles</p>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {chapterChallenges.map((challenge) => {
                  const active = challenge.id === room.selectedChallengeId;
                  return (
                    <button
                      key={challenge.id}
                      type="button"
                      disabled={!me?.isHost}
                      onClick={() => onConfigure(challenge.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-gold/50 bg-gold/10"
                          : "border-white/10 bg-white/5 hover:border-gold/30 hover:bg-white/10"
                      } disabled:cursor-default disabled:opacity-70`}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-gold/70">
                        {challengeTypeLabel[challenge.challengeType]}
                      </p>
                      <p className="mt-2 font-semibold text-parchment">{challenge.minigameTitle}</p>
                      <p className="mt-2 text-sm text-mist/70">{challenge.teaser}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {room.selectedChallenge ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-sm uppercase tracking-[0.2em] text-gold/70">
                Capítulo {room.selectedChallenge.chapterNumber}
              </p>
              <p className="mt-2 font-display text-2xl text-parchment">{room.selectedChallenge.chapterTitle}</p>
              <p className="mt-1 text-lg text-mist/85">{room.selectedChallenge.minigameTitle}</p>
              <p className="mt-2 text-sm text-mist/70">{room.selectedChallenge.teaser}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {room.players.map((player) => (
            <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="font-semibold text-parchment">{player.name}</p>
              <p className="mt-1 text-sm text-mist/65">
                {player.isHost ? "Anfitrión" : "Jugador"} {player.connected ? "conectado" : "desconectado"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {me?.isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Lanzar minijuego
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
              Esperando a que el anfitrión elija el reto y lance la partida.
            </div>
          )}
          {!canStart && me?.isHost ? (
            <p className="text-sm text-mist/70">Necesitas al menos {MIN_PLAYERS} jugadores para comenzar.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
