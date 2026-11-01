import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { playChipPush } from "@/utils/sounds";

const POSITION_BY_SEAT = {
  1: "DEALER",
  2: "SB",
  3: "BB",
  4: "UTG",
  5: "CO",
  6: "ALL IN",
};

const COMMUNITY_FACES = [
  ["7♠", "suit-black"],
  ["9♥", "suit-red"],
  ["Q♦", "suit-red"],
  ["3♣", "suit-black"],
  ["A♠", "suit-black"],
];

function CommunityCards({ flopUp, turnUp, riverUp }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setArmed(true), 900);
    return () => clearTimeout(t);
  }, []);

  const up = [
    armed && flopUp,
    armed && flopUp,
    armed && flopUp,
    armed && turnUp,
    armed && riverUp,
  ];

  return (
    <div className="community-block">
      <div className="community-row" data-testid="community-row">
        {COMMUNITY_FACES.map(([face, suit], i) => (
          <span
            key={face}
            className={`community-card${up[i] ? " is-up" : ""}${i === 4 && up[i] ? " ace" : ""}`}
            data-testid={`community-card-${i + 1}`}
            style={{ "--d": `${(i % 3) * 0.22}s` }}
          >
            <span className="cc-inner">
              <span className="cc-face cc-front">
                <b className={suit}>{face}</b>
              </span>
              <span className="cc-back" aria-hidden="true" />
            </span>
          </span>
        ))}
      </div>
      {armed && riverUp && (
        <p className="river-line" data-testid="river-line">
          The best hand was always the one he hadn’t played yet.
        </p>
      )}
    </div>
  );
}

export default function PokerTable({ players, selectedId, readIds, dealerId, onSelectSeat }) {
  const flopUp = readIds.has(1) && readIds.has(2);
  const turnUp = flopUp && readIds.has(3) && readIds.has(4);
  const riverUp = turnUp && readIds.has(5) && readIds.has(6);

  const [showdown, setShowdown] = useState(false);

  useEffect(() => {
    if (!riverUp || showdown) return undefined;
    const t = setTimeout(() => setShowdown(true), 1200);
    return () => clearTimeout(t);
  }, [riverUp, showdown]);

  useEffect(() => {
    if (showdown) playChipPush();
  }, [showdown]);

  return (
    <section className="table-zone" aria-label="Poker table">
      <div className="table-assembly">
        <div className="table-rail">
          <div className="table-felt">
            <span className="felt-texture" aria-hidden="true" />
            <span className="felt-line" aria-hidden="true" />
            <div className="table-center">
              <CommunityCards
                flopUp={flopUp}
                turnUp={turnUp}
                riverUp={riverUp}
              />
              <div
                className={`pot-area${showdown ? " is-showdown" : ""}`}
                data-testid="pot-area"
                aria-hidden="true"
              >
                <span className="pot-shimmer" />
                <div className="hero-chips">
                  <span className="hero-chip chip-teal" />
                  <span className="hero-chip chip-red" />
                  <span className="hero-chip chip-blue" />
                  <span className="hero-chip chip-gold" />
                </div>
                <span className="pot-stack ps-1"><i /><i /><i /></span>
                <span className="pot-stack ps-2"><i /><i /><i /><i /><i /></span>
                <span className="pot-stack ps-3"><i /><i /></span>
                <span className="pot-stack ps-4"><i /><i /><i /><i /></span>
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
            onMouseEnter={() =>
              window.dispatchEvent(
                new CustomEvent("dealer-hover", { detail: player.name }),
              )
            }
            onMouseLeave={() =>
              window.dispatchEvent(
                new CustomEvent("dealer-hover", { detail: null }),
              )
            }
            onFocus={() =>
              window.dispatchEvent(
                new CustomEvent("dealer-hover", { detail: player.name }),
              )
            }
            onBlur={() =>
              window.dispatchEvent(
                new CustomEvent("dealer-hover", { detail: null }),
              )
            }
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
            <span
              className={`hole-cards hole-${player.id}`}
              data-testid={`hole-cards-${player.id}`}
              aria-hidden="true"
            >
              <span />
              <span />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
