import { motion } from 'framer-motion';
import { Match } from '../types';
import { Heart, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  match: Match;
  onClose: () => void;
}

export default function MatchModal({ match, onClose }: MatchModalProps) {
  const navigate = useNavigate();
  const photo = match.photos[0] || 'https://via.placeholder.com/200';

  const handleSendMessage = () => {
    navigate(`/chat/${match.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6"
        >
          <Heart className="w-10 h-10 text-white" fill="currentColor" />
        </motion.div>

        <h2 className="text-3xl font-bold text-dark mb-2">It's a Match!</h2>
        <p className="text-gray-600 mb-6">
          You and {match.name} liked each other
        </p>

        <div className="mb-6">
          <img
            src={photo}
            alt={match.name}
            className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary"
          />
          <p className="mt-3 font-semibold text-lg">
            {match.name}, {match.age}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Keep Swiping
          </button>
          <button
            onClick={handleSendMessage}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Message
          </button>
        </div>
      </motion.div>
    </div>
  );
}

