import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-white to-primary/10 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <header className="space-y-2">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wide">
            Known
          </p>
          <h1 className="text-3xl font-bold text-dark">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated on {new Date().toLocaleDateString()}</p>
        </header>

        <section className="space-y-4 text-gray-700 text-base leading-relaxed">
          <p>
            This Privacy Policy explains how Known ("we", "us", or "our") collects, uses,
            and protects your personal information when you use our application, website, and related
            services (collectively, the “Services”). By using the Services, you consent to the data
            practices described here.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name, email, age, location,
              profile details, and photos. We may also collect usage data, device information, and
              approximate location in order to personalize matches and improve the Services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve the Services, facilitate matches,
              communicate with you, enhance safety, and comply with legal obligations. We may send
              transactional emails or push notifications related to your account activity.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">3. Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share limited data with service
              providers that support our operations (such as hosting, analytics, or messaging) under
              strict confidentiality obligations. We may also disclose information if required by law
              or to protect the safety of our users.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">4. Data Retention</h2>
            <p>
              We retain your information as long as your account is active or as needed to provide
              the Services. You may request deletion of your account at any time, after which we will
              remove or anonymize your personal data unless legal obligations require retention.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">5. Your Choices</h2>
            <p>
              You can access and update your profile information in the app. You may opt out of
              marketing communications and request account deletion. For location or push
              notifications, adjust permissions in your device settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">6. Security</h2>
            <p>
              We implement administrative, technical, and physical safeguards to protect your data.
              However, no online service can guarantee absolute security. Use good judgment when
              sharing information with other users.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">7. Children’s Privacy</h2>
            <p>
              The Services are not intended for individuals under 18. We do not knowingly collect
              data from minors. If you believe a minor has created an account, contact us so we can
              remove the information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">8. Policy Updates</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be communicated
              via the app or email. Continued use of the Services after changes constitutes acceptance
              of the updated policy.
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-200 pt-6 text-sm text-gray-600 space-y-2">
          <p>
            Questions about this Privacy Policy? Email us at{' '}
            <a href="mailto:support@known.app" className="text-primary font-semibold">
              support@known.app
            </a>
            .
          </p>
          <p>
            Looking for our terms of service? Read the{' '}
            <Link to="/terms" className="text-primary font-semibold hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}


