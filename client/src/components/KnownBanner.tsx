import { useEffect, useState } from 'react';
import { Snowflake, Calendar, Heart, Sun, Leaf } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  season: 'peak' | 'approaching' | 'offseason';
}

interface KnownBannerProps {
  size?: 'default' | 'compact';
}

export default function KnownBanner({ size = 'compact' }: KnownBannerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Matchmaking sprint: November 1 - February 14 (Valentine's Day)
    const seasonStart = new Date(currentYear, 10, 1); // Nov 1
    const seasonEnd = new Date(currentYear + 1, 1, 14); // Feb 14 next year
    
    // If we're past Feb 14, use next year's sprint window
    if (now > seasonEnd) {
      seasonStart.setFullYear(currentYear + 1);
      seasonEnd.setFullYear(currentYear + 2);
    }
    
    let targetDate: Date;
    let season: 'peak' | 'approaching' | 'offseason';
    
    // Peak sprint window (Nov 1 - Feb 14)
    if (now >= seasonStart && now <= seasonEnd) {
      targetDate = seasonEnd;
      season = 'peak';
    }
    // Approaching sprint period (Sept 1 - Oct 31)
    else if (now.getMonth() >= 8 && now < seasonStart) {
      targetDate = seasonStart;
      season = 'approaching';
    }
    // Off season
    else {
      targetDate = seasonStart;
      season = 'offseason';
    }
    
    const difference = targetDate.getTime() - now.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, season };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getMessage = () => {
    switch (timeLeft.season) {
      case 'peak':
        return {
          title: "Match Sprint is live",
          subtitle: `${timeLeft.days} days left to meet people before this sprint wraps`,
          icon: <Snowflake className="w-5 h-5" />,
          gradient: "from-icy-400 via-icy-500 to-icy-600",
          tip: "Peak sprint tip: refresh your profile and reach out to promising matches today",
          tipIcon: <Snowflake className="w-3 h-3" />
        };
      case 'approaching':
        return {
          title: "Match Sprint begins soon",
          subtitle: `${timeLeft.days} days until launch. Connect with people before spots fill up.`,
          icon: <Calendar className="w-5 h-5" />,
          gradient: "from-orange-500 to-red-600",
          tip: "Polish your profile so people know what you're building",
          tipIcon: <Leaf className="w-3 h-3" />
        };
      case 'offseason':
        return {
          title: "Stay ready for the next sprint",
          subtitle: `${timeLeft.days} days until our next wave of introductions kicks off`,
          icon: <Heart className="w-5 h-5" />,
          gradient: "from-pink-500 to-rose-600",
          tip: "Use this time to fine-tune your preferences and goals",
          tipIcon: <Sun className="w-3 h-3" />
        };
    }
  };

  const message = getMessage();

  // Don't show during deep off-season (March-July)
  const now = new Date();
  if (timeLeft.season === 'offseason' && now.getMonth() >= 2 && now.getMonth() <= 6) {
    return null;
  }

  if (size === 'compact') {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${message.gradient} p-2.5 mb-2 shadow-sm`}>
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white">
            {message.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white uppercase tracking-wide">{message.title}</p>
            <p className="text-[11px] text-white/85 leading-snug">{message.subtitle}</p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/20 text-white rounded-md px-2 py-1 min-w-[52px]">
            <span className="text-sm font-bold leading-none">{timeLeft.days}</span>
            <span className="text-[10px] uppercase tracking-wide">days</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${message.gradient} p-3 mb-3 shadow-md`}>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-8 -left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 text-white">
              {message.icon}
            </div>
            <h3 className="text-lg font-semibold text-white">{message.title}</h3>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">{message.subtitle}</p>
        </div>

        <div className="flex flex-col items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-2xl font-bold text-white leading-none">{timeLeft.days}</div>
          <div className="text-[10px] text-white/80 uppercase tracking-wider">Days</div>
        </div>
      </div>
    </div>
  );
}

