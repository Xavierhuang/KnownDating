import { useEffect, useState } from 'react';
import { Snowflake as SnowflakeIcon } from 'lucide-react';

interface Snowflake {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  opacity: number;
}

export default function Snowflakes() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    // Create 50 snowflakes
    const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 3 + Math.random() * 4, // 3-7 seconds
      animationDelay: Math.random() * 2,
      size: 4 + Math.random() * 6, // 4-10px
      opacity: 0.3 + Math.random() * 0.5, // 0.3-0.8
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {snowflakes.map((flake) => (
        <SnowflakeIcon
          key={flake.id}
          className="absolute text-white/60"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        />
      ))}
    </div>
  );
}

