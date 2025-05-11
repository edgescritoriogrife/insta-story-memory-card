
import React, { useEffect, useState } from "react";

type EmojiAnimationProps = {
  emoji: string;
};

export const EmojiAnimation = ({ emoji }: EmojiAnimationProps) => {
  const [emojis, setEmojis] = useState<
    Array<{ id: number; left: string; delay: string; duration: string }>
  >([]);

  useEffect(() => {
    // Garantir que emoji está definido
    if (!emoji) return;
    
    const newEmojis = Array.from({ length: 20 }).map((_, index) => {
      return {
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 3}s`,
      };
    });
    setEmojis(newEmojis);
  }, [emoji]);

  // Se não tiver emoji definido, não renderiza nada
  if (!emoji) return null;

  return (
    <div className="emoji-rain absolute inset-0 overflow-hidden pointer-events-none z-30">
      {emojis.map((item) => (
        <span
          key={item.id}
          className="emoji absolute animate-fall"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-5vh) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) scale(1.2);
            opacity: 0.7;
          }
        }
        .emoji {
          font-size: 24px;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .emoji-rain {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};
