import { Link } from 'react-router-dom';
import { Heart, Users, User, MessageSquare } from 'lucide-react';

const heroImage = `${import.meta.env.BASE_URL}images/diana.jpg`;

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 pb-12" style={{ paddingTop: 'calc(2rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-md mx-auto">
          {/* Tagline */}
          <p className="text-sm text-pink-400 font-medium mb-2">Dating for People Who Value Depth</p>
          
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4 leading-tight">
            Where Deep{' '}
            <span className="text-primary">Connections Begin</span>
          </h1>
          
          {/* Description */}
          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            Move beyond surface-level swipes. Answer thoughtful compatibility questions through meaningful conversation and connect with people who truly align with your values, goals, and vision for the future.
          </p>
          
          {/* Hero Image */}
          <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img
              src={heroImage}
              alt="People connecting"
              className="w-full h-64 object-cover"
            />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-founder-gradient px-6 py-4 text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              <Heart className="w-5 h-5" fill="currentColor" />
              Create Your Profile
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-4 text-dark font-semibold hover:border-primary hover:bg-gray-50 transition"
            >
              <User className="w-5 h-5" />
              Browse Profiles
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-3">
              How It Works
            </h2>
            <p className="text-gray-600 text-base">
              Answer 25 core compatibility questions through an intimate chat interface. Find deep connection through meaningful conversation.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-primary" />}
              title="Chat-Based Questions"
              description="Answer thoughtfully through a conversational interface. No forms, no checkboxes—just authentic dialogue about what matters."
            />
            <FeatureCard
              icon={<Heart className="h-6 w-6 text-primary" />}
              title="5 Core Compatibility Areas"
              description="Life Direction, Emotional Readiness, Connection & Communication, Lifestyle Alignment, and Commitment Vision."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Deep Matching"
              description="Connect with people who share your values, communication style, and vision for the future—not just surface-level attraction."
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-16 bg-cta-gradient">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to Find Your Person?
          </h2>
          <p className="text-white/90 text-base mb-6">
            Start by answering thoughtful questions about life, love, and what matters most. Connect with someone who truly gets you—beyond the profile picture.
          </p>
          <Link
            to="/register"
            className="inline-block rounded-xl bg-dark px-8 py-4 text-white font-semibold shadow-lg hover:bg-gray-800 transition"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-white border-t border-gray-100">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-gray-500 mb-4">
            © {new Date().getFullYear()} Known. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link to="/privacy" className="text-gray-500 hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
