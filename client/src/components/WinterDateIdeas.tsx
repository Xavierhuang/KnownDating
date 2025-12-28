import { Coffee, Snowflake, Film, Music, Utensils, Mountain } from 'lucide-react';

interface DateIdea {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const winterDateIdeas: DateIdea[] = [
  {
    icon: <Coffee className="w-5 h-5" />,
    title: "Cozy Coffee Date",
    description: "Hot cocoa, warm lattes, and deep conversations"
  },
  {
    icon: <Snowflake className="w-5 h-5" />,
    title: "Ice Skating",
    description: "Classic winter meetup on ice"
  },
  {
    icon: <Film className="w-5 h-5" />,
    title: "Movie Marathon",
    description: "Blankets, snacks, and a curated film list"
  },
  {
    icon: <Music className="w-5 h-5" />,
    title: "Holiday Market",
    description: "Browse festive stalls and share warm mulled wine"
  },
  {
    icon: <Utensils className="w-5 h-5" />,
    title: "Cooking Together",
    description: "Make comfort food and swap startup stories"
  },
  {
    icon: <Mountain className="w-5 h-5" />,
    title: "Winter Hike",
    description: "Bundle up for a crisp outdoor adventure"
  }
];

interface WinterDateIdeasProps {
  onClose?: () => void;
  compact?: boolean;
}

export default function WinterDateIdeas({ onClose, compact = false }: WinterDateIdeasProps) {
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-lg font-bold text-dark mb-3 flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-500" />
          Winter Date Ideas
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {winterDateIdeas.slice(0, 4).map((idea, index) => (
            <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-2xl mb-1 text-blue-500">
                {idea.icon}
              </div>
              <div className="text-sm font-semibold text-dark">{idea.title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Winter Date Ideas</h2>
          </div>
          <p className="text-white/90">Cozy activities to enjoy together this season</p>
        </div>

        {/* Date Ideas Grid */}
        <div className="p-6 grid gap-4">
          {winterDateIdeas.map((idea, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                {idea.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-dark">{idea.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{idea.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-dark mb-2">Pro Tips:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Indoor activities work great in cold weather</li>
              <li>• Dress in layers for outdoor winter dates</li>
              <li>• Hot drinks make everything better</li>
              <li>• Set clear intentions so people know what you are building</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}










