import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { logger } from '../utils/logger';
import { Match } from '../types';
import { MessageCircle, HeartHandshake } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch (error) {
      logger.error('Failed to load matches', error as Error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen px-4 relative z-10">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-dark mb-2">No matches yet</h2>
          <p className="text-gray-600 mb-6">
            Start swiping to meet your next partner in building.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Start Swiping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200 page-with-nav pb-8 px-4 relative">
      <div className="max-w-2xl mx-auto relative z-10 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <HeartHandshake className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-dark">Your Matches</h1>
        </div>

        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => navigate(`/chat/${match.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  const photo = match.photos[0] || 'https://via.placeholder.com/100';
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-4 flex items-center gap-4 active:scale-[0.98]"
    >
      <img
        src={photo}
        alt={match.name}
        className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
      />

      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="font-semibold text-lg text-dark mb-1 truncate">
          {match.name}, {match.age}
        </h3>
        {match.last_message ? (
          <p className="text-gray-600 text-sm truncate leading-relaxed">
            {match.last_message}
          </p>
        ) : (
          <p className="text-gray-400 text-sm italic">No messages yet</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {match.last_message_time && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(new Date(match.last_message_time), { addSuffix: true })}
          </span>
        )}
        <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
      </div>
    </div>
  );
}

