import { WinnerSummary } from "@shared/game";

interface WinnerScreenProps {
  winners: WinnerSummary[];
}

export function WinnerScreen({ winners }: WinnerScreenProps) {
  const champion = winners[0];

  return (
    <section className="panel-strong p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Caso cerrado</p>
      <h2 className="mt-3 font-display text-5xl text-parchment">Círculo del ganador</h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-mist/85">
        El misterio del farol está resuelto. Cada pista fue ordenada, cada clave fue abierta y la deducción
        final ha concluido.
      </p>

      {champion ? (
        <div className="mt-8 rounded-[2rem] border border-gold/25 bg-gold/10 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Detective principal</p>
          <h3 className="mt-3 font-display text-4xl text-parchment">{champion.name}</h3>
          <p className="mt-2 text-xl text-gold">{champion.score} puntos</p>
        </div>
      ) : null}
    </section>
  );
}
