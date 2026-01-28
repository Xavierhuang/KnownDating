import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateAge, 
  validateGender, 
  validateInterestedIn 
} from '../utils/validation';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '25',
    gender: '',
    interested_in: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    const nameValidation = validateName(formData.name);
    if (!nameValidation.valid) {
      setError(nameValidation.error || 'Invalid name');
      return;
    }

    const ageValidation = validateAge(formData.age);
    if (!ageValidation.valid) {
      setError(ageValidation.error || 'Invalid age');
      return;
    }

    const genderValidation = validateGender(formData.gender);
    if (!genderValidation.valid) {
      setError(genderValidation.error || 'Invalid gender');
      return;
    }

    const interestedInValidation = validateInterestedIn(formData.interested_in);
    if (!interestedInValidation.valid) {
      setError(interestedInValidation.error || 'Invalid preferences');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service to create an account');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        gender: formData.gender,
        interested_in: formData.interested_in,
      });
      // AuthContext will handle redirect to /compatibility
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
      setLoading(false);
    }
  };

  const toggleInterestedIn = (gender: string) => {
    setFormData(prev => ({
      ...prev,
      interested_in: prev.interested_in.includes(gender)
        ? prev.interested_in.filter(g => g !== gender)
        : [...prev.interested_in, gender]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200 flex items-center justify-center px-4 relative">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-icy-200 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold text-dark mb-2">Join Known</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              inputMode="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="25"
              min="18"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interested in dating
            </label>
            <div className="flex flex-wrap gap-2">
              {['male', 'female', 'non-binary', 'other'].map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => toggleInterestedIn(gender)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    formData.interested_in.includes(gender)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
            {formData.interested_in.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">Select at least one</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-primary font-semibold hover:underline">
                Terms of Service
              </Link>
              {' '}and acknowledge the{' '}
              <Link to="/privacy" target="_blank" className="text-primary font-semibold hover:underline">
                Privacy Policy
              </Link>
              . I understand that Known has zero tolerance for objectionable content or abusive behavior.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptedTerms}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
