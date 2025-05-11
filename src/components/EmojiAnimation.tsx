
import React, { useEffect, useState } from "react";

type EmojiAnimationProps = {
  emoji: string;
};

export const EmojiAnimation = ({ emoji }: EmojiAnimationProps) => {
  const [emojis, setEmojis] = useState<
    Array<{ id: number; left: string; delay: string; duration: string }>
  >([]);

  useEffect(() => {
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

  return (
    <div className="emoji-rain">
      {emojis.map((item) => (
        <span
          key={item.id}
          className="emoji"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};
