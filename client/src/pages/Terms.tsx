import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">
            Known
          </p>
          <h1 className="text-3xl font-bold text-dark">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated on {new Date().toLocaleDateString()}</p>
        </header>

        <section className="space-y-4 text-gray-700 text-base leading-relaxed">
          <p>
            Welcome to Known. By accessing or using our application, website, or associated
            services (collectively, the “Services”), you agree to be bound by these Terms of Service.
            If you do not agree, please discontinue use immediately.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">1. Eligibility</h2>
            <p>
              You must be at least 18 years old to use the Services. By creating an account, you
              certify that you meet this requirement and that any information you provide is accurate
              and up to date.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">2. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and
              for all activity that occurs under your account. Notify us promptly of any unauthorized
              use or security breach.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">3. Acceptable Use & Zero Tolerance Policy</h2>
            <p>
              You agree to use the Services lawfully and respectfully. <strong>Known has zero tolerance for objectionable content or abusive behavior.</strong> Prohibited activities include:
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Harassment, bullying, or threatening behavior</li>
              <li>Hate speech, discrimination, or prejudiced content</li>
              <li>Sexual exploitation, nudity, or pornographic content</li>
              <li>Spam, solicitation, or commercial advertising</li>
              <li>Impersonation or fraudulent representation</li>
              <li>Violence, self-harm, or illegal activities</li>
              <li>Sharing others' personal information without consent</li>
            </ul>
            <p className="mt-2">
              <strong>Violations will result in immediate account suspension or termination.</strong> All reported content is reviewed within 24 hours, and offending users are permanently removed from the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">4. Content Ownership</h2>
            <p>
              You retain ownership of content you upload but grant Known a non-exclusive,
              worldwide, royalty-free license to host, display, and share that content as necessary to
              operate the Services. We reserve the right to remove content that violates these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">5. Termination</h2>
            <p>
              We may suspend or terminate access to the Services at our discretion if you violate
              these Terms or engage in unsafe behavior. You may also delete your account at any time
              using the in-app settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">6. Disclaimer of Warranties</h2>
            <p>
              The Services are provided “as is” without warranties of any kind. We do not guarantee
              successful matches or uninterrupted availability. Use the platform at your own risk and
              exercise caution when interacting with other users.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Known is not liable for any indirect,
              incidental, or consequential damages arising from your use of the Services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark mb-2">8. Changes to These Terms</h2>
            <p>
              We may update these Terms occasionally. Continued use of the Services after changes take
              effect constitutes acceptance of the revised Terms. We recommend reviewing this page
              periodically.
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-200 pt-6 text-sm text-gray-600 space-y-2">
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:support@known.app" className="text-primary font-semibold">
              support@known.app
            </a>
            .
          </p>
          <p>
            Looking for our privacy practices? Read the{' '}
            <Link to="/privacy" className="text-primary font-semibold hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}


