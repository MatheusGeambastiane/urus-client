"use client";

import { useEffect, useState } from "react";

type LetterRevealProps = {
  text: string;
  className?: string;
  initialDelay?: number;
  perLetterDelay?: number;
  letterDuration?: number;
  fadeInDelay?: number;
  fadeInDuration?: number;
  enableGlow?: boolean;
  glowStartAfterMs?: number;
  repeatEveryMs?: number;
};

export function LetterReveal({
  text,
  className,
  initialDelay = 0.3,
  perLetterDelay = 0.15,
  letterDuration = 0.4,
  fadeInDelay = 0.5,
  fadeInDuration = 0.3,
  enableGlow = true,
  glowStartAfterMs = 1450,
  repeatEveryMs = 4000,
}: LetterRevealProps) {
  const [showGlow, setShowGlow] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!enableGlow) return;

    const glowTimer = setTimeout(() => setShowGlow(true), glowStartAfterMs);

    const repeatTimer = setInterval(() => {
      setShowGlow(false);
      setAnimationKey((prev) => prev + 1);

      setTimeout(() => setShowGlow(true), glowStartAfterMs);
    }, repeatEveryMs);

    return () => {
      clearTimeout(glowTimer);
      clearInterval(repeatTimer);
    };
  }, [animationKey, enableGlow, glowStartAfterMs, repeatEveryMs]);

  const chars = Array.from(text);

  return (
    <div className="relative">
      {enableGlow && showGlow ? (
        <div className="letter-reveal-glow absolute inset-0 -z-10">
          <div className="absolute inset-0 blur-[30px] opacity-20">
            <span className={className}>{text}</span>
          </div>
          <div className="absolute inset-0 blur-[15px] opacity-25">
            <span className={className}>{text}</span>
          </div>
        </div>
      ) : null}

      <span
        className={`letter-reveal-text relative z-10 ${className ?? ""}`}
        style={{
          animationDuration: `${fadeInDuration}s`,
          animationDelay: `${fadeInDelay}s`,
          filter: showGlow
            ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))"
            : "none",
          WebkitFilter: showGlow
            ? "drop-shadow(0 0 5px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))"
            : "none",
        }}
      >
        {chars.map((char, idx) => (
          <span
            key={`${animationKey}-${idx}`}
            className="letter-reveal-letter inline-block"
            style={{
              animationDuration: `${letterDuration}s`,
              animationDelay: `${initialDelay + idx * perLetterDelay}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      <style jsx>{`
        .letter-reveal-text {
          animation-name: fadeInText;
          animation-fill-mode: forwards;
          opacity: 0;
        }

        .letter-reveal-letter {
          animation-name: revealLetter;
          animation-fill-mode: forwards;
          opacity: 0;
          clip-path: inset(0 100% 0 0);
        }

        .letter-reveal-glow {
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes revealLetter {
          0% {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0% 0 0);
          }
        }

        @keyframes fadeInText {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes glowPulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
