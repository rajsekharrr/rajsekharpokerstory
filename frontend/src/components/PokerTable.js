import { Check } from "lucide-react";

const POSITION_BY_SEAT = {
  1: "DEALER",
  2: "SB",
  3: "BB",
  4: "UTG",
  5: "CO",
  6: "ALL IN",
};

export default function PokerTable({ players, selectedId, readIds, dealerId, onSelectSeat }) {
  return (
    <section className="table-zone" aria-label="Poker table">
      <div className="table-assembly">
        <div className="table-rail">
          <div className="table-felt">
            <span className="felt-texture" aria-hidden="true" />
            <span className="felt-line" aria-hidden="true" />
            <div className="table-center">
              <div className="hero-chips" aria-hidden="true">
                <span className="hero-chip chip-teal" />
                <span className="hero-chip chip-red" />
                <span className="hero-chip chip-blue" />
                <span className="hero-chip chip-gold" />
              </div>
              <p className="tagline">Every Chapter Was a Bet</p>
            </div>
          </div>
        </div>
        <span
          className={`dealer-chip d-pos-${dealerId}`}
          data-testid="dealer-chip"
          role="status"
          aria-label="Dealer button"
        >
          <b>D</b>
        </span>
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            className={`seat seat-${player.id}${selectedId === player.id ? " is-selected" : ""}`}
            data-testid={`seat-${player.id}`}
            aria-pressed={selectedId === player.id}
            onClick={() => onSelectSeat(player.id)}
          >
            <span className="seat-avatar">
              <span className="seat-initials">{player.initials}</span>
              {readIds.has(player.id) && (
                <span
                  className="seat-read-badge"
                  data-testid={`read-badge-${player.id}`}
                  role="status"
                  aria-label="Chapter read"
                >
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="seat-name">{player.name}</span>
            <span
              className={`seat-pos${dealerId === player.id ? " is-dealer" : ""}`}
              data-testid={`position-badge-${player.id}`}
            >
              {POSITION_BY_SEAT[player.id]}
            </span>
            <span className="seat-chips" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
