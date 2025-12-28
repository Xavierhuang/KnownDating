import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';
import { 
  COMPATIBILITY_QUESTIONS, 
  CATEGORY_INFO,
  CompatibilityCategory,
  CompatibilityAnswer 
} from '../types/compatibility';
import { Send, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  type: 'question' | 'answer' | 'category';
  content: string;
  questionId?: string;
  category?: CompatibilityCategory;
  timestamp: Date;
}

export default function CompatibilityChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentQuestion = currentQuestionIndex < COMPATIBILITY_QUESTIONS.length 
    ? COMPATIBILITY_QUESTIONS[currentQuestionIndex] 
    : null;

  useEffect(() => {
    loadExistingAnswers();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAnswer]);

  const loadExistingAnswers = async () => {
    if (!user || !user.id) return;
    
    setIsLoading(true);
    try {
      // Get token from localStorage (for REST API login)
      const token = localStorage.getItem('known_token');
      if (!token) {
        logger.error('No auth token found');
        setIsLoading(false);
        return;
      }
      
      // Use Firestore REST API with token (works for both SDK and REST API login)
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'known-dating-e5f04';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/compatibility/${user.id}`;
      
      const response = await fetch(firestoreUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const initialMessages: ChatMessage[] = [];
      const answersMap = new Map<string, string>();
      
      if (response.ok) {
        const firestoreData = await response.json();
        
        // Convert Firestore REST API format to regular object
        if (firestoreData.fields) {
          const data: any = {};
          for (const [key, value] of Object.entries(firestoreData.fields)) {
            const fieldValue = value as any;
            if (fieldValue.stringValue !== undefined) {
              data[key] = fieldValue.stringValue;
            } else if (fieldValue.integerValue !== undefined) {
              data[key] = parseInt(fieldValue.integerValue);
            } else if (fieldValue.doubleValue !== undefined) {
              data[key] = parseFloat(fieldValue.doubleValue);
            } else if (fieldValue.booleanValue !== undefined) {
              data[key] = fieldValue.booleanValue;
            } else if (fieldValue.arrayValue !== undefined) {
              data[key] = fieldValue.arrayValue.values?.map((v: any) => {
                if (v.mapValue) {
                  // Handle nested objects (like CompatibilityAnswer)
                  const obj: any = {};
                  for (const [k, val] of Object.entries(v.mapValue.fields || {})) {
                    const fv = val as any;
                    if (fv.stringValue !== undefined) obj[k] = fv.stringValue;
                    else if (fv.integerValue !== undefined) obj[k] = parseInt(fv.integerValue);
                    else if (fv.doubleValue !== undefined) obj[k] = parseFloat(fv.doubleValue);
                    else if (fv.booleanValue !== undefined) obj[k] = fv.booleanValue;
                    else if (fv.timestampValue !== undefined) obj[k] = fv.timestampValue;
                  }
                  return obj;
                }
                return v.stringValue || v.integerValue || v.doubleValue || v.booleanValue || null;
              }) || [];
            } else if (fieldValue.timestampValue !== undefined) {
              data[key] = fieldValue.timestampValue;
            } else if (fieldValue.nullValue !== undefined) {
              data[key] = null;
            }
          }
          
          if (data.answers) {
            // Rebuild chat history from saved answers - only show questions that have been answered
            let lastCategory: CompatibilityCategory | null = null;
            
            COMPATIBILITY_QUESTIONS.forEach((question) => {
              const answer = data.answers.find((a: CompatibilityAnswer) => a.questionId === question.id);
              
              // Only add to chat if question has been answered
              if (answer) {
                // Add category header if it changed
                if (question.category !== lastCategory) {
                  const categoryInfo = CATEGORY_INFO[question.category];
                  initialMessages.push({
                    type: 'category',
                    content: `${categoryInfo.title} - ${categoryInfo.subtitle}`,
                    category: question.category,
                    timestamp: new Date(),
                  });
                  lastCategory = question.category;
                }
                
                // Add question
                initialMessages.push({
                  type: 'question',
                  content: question.question,
                  questionId: question.id,
                  timestamp: new Date(),
                });
                
                // Add answer
                answersMap.set(question.id, answer.answer);
                initialMessages.push({
                  type: 'answer',
                  content: answer.answer,
                  questionId: question.id,
                  timestamp: new Date(),
                });
              }
            });
          }
        }
      } else if (response.status === 404) {
        // Document doesn't exist yet - new user, no existing answers
        // This is fine, we'll show the first question
        logger.info('No existing compatibility profile found - new user');
      } else {
        // Other error
        const errorText = await response.text();
        throw new Error(`Firestore error: ${response.status} - ${errorText}`);
      }
      
      setMessages(initialMessages);
      setAnswers(answersMap);
      
      // Find first unanswered question
      const firstUnanswered = COMPATIBILITY_QUESTIONS.findIndex(
        q => !answersMap.has(q.id)
      );
      
      if (firstUnanswered === -1) {
        // All questions completed
        navigate('/matches');
      } else {
        // Add the current unanswered question to the chat
        const currentQuestion = COMPATIBILITY_QUESTIONS[firstUnanswered];
        const prevQuestion = firstUnanswered > 0 ? COMPATIBILITY_QUESTIONS[firstUnanswered - 1] : null;
        
        // Add category header if category changed
        if (!prevQuestion || currentQuestion.category !== prevQuestion.category) {
          const categoryInfo = CATEGORY_INFO[currentQuestion.category];
          initialMessages.push({
            type: 'category',
            content: `${categoryInfo.title} - ${categoryInfo.subtitle}`,
            category: currentQuestion.category,
            timestamp: new Date(),
          });
        }
        
        // Add current question
        initialMessages.push({
          type: 'question',
          content: currentQuestion.question,
          questionId: currentQuestion.id,
          timestamp: new Date(),
        });
        
        setMessages(initialMessages);
        setCurrentQuestionIndex(firstUnanswered);
      }
    } catch (error) {
      logger.error('Failed to load compatibility answers', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !currentQuestion || isSubmitting) return;

    // Validate answer
    const { validateCompatibilityAnswer } = await import('../utils/validation');
    const validation = validateCompatibilityAnswer(currentAnswer.trim());
    if (!validation.valid) {
      alert(validation.error || 'Please provide a more detailed answer');
      return;
    }

    const answerText = currentAnswer.trim();
    setIsSubmitting(true);

    // Add answer to chat
    const answerMessage: ChatMessage = {
      type: 'answer',
      content: answerText,
      questionId: currentQuestion.id,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, answerMessage]);
    setAnswers(prev => new Map(prev).set(currentQuestion.id, answerText));
    setCurrentAnswer('');

    // Save to Firestore using REST API
    try {
      if (!user || !user.id) return;

      // Get token from localStorage
      const token = localStorage.getItem('known_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const newAnswers = new Map(answers);
      newAnswers.set(currentQuestion.id, answerText);

      const answersArray: CompatibilityAnswer[] = Array.from(newAnswers.entries()).map(([questionId, answer]) => ({
        questionId,
        answer,
        answeredAt: new Date().toISOString(),
      }));

      const completedCategories = new Set<string>();
      COMPATIBILITY_QUESTIONS.forEach(q => {
        const catQuestions = COMPATIBILITY_QUESTIONS.filter(cq => cq.category === q.category);
        const catAnswers = catQuestions.filter(cq => newAnswers.has(cq.id));
        if (catAnswers.length === catQuestions.length) {
          completedCategories.add(q.category);
        }
      });

      // Convert to Firestore REST API format
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'known-dating-e5f04';
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/compatibility/${user.id}`;
      
      // Convert answers array to Firestore format
      const answersField = {
        arrayValue: {
          values: answersArray.map(answer => ({
            mapValue: {
              fields: {
                questionId: { stringValue: answer.questionId },
                answer: { stringValue: answer.answer },
                answeredAt: { stringValue: answer.answeredAt },
              }
            }
          }))
        }
      };
      
      const completedCategoriesField = {
        arrayValue: {
          values: Array.from(completedCategories).map(cat => ({ stringValue: cat }))
        }
      };
      
      const documentData = {
        fields: {
          userId: { stringValue: user.id },
          answers: answersField,
          completedCategories: completedCategoriesField,
          lastUpdated: { timestampValue: new Date().toISOString() },
        }
      };

      const response = await fetch(firestoreUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save answer: ${response.status} - ${errorText}`);
      }

      // Move to next question only after answer is saved
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < COMPATIBILITY_QUESTIONS.length) {
        const nextQuestion = COMPATIBILITY_QUESTIONS[nextIndex];
        const prevQuestion = COMPATIBILITY_QUESTIONS[currentQuestionIndex];
        
        // Add category header if category changed
        if (nextQuestion.category !== prevQuestion.category) {
          const categoryInfo = CATEGORY_INFO[nextQuestion.category];
          setMessages(prev => [...prev, {
            type: 'category',
            content: `${categoryInfo.title} - ${categoryInfo.subtitle}`,
            category: nextQuestion.category,
            timestamp: new Date(),
          }]);
        }
        
        // Add next question after a short delay (only after answer is saved)
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'question',
            content: nextQuestion.question,
            questionId: nextQuestion.id,
            timestamp: new Date(),
          }]);
          setCurrentQuestionIndex(nextIndex);
          setIsSubmitting(false);
        }, 800);
      } else {
        // All questions completed!
        setIsSubmitting(false);
        setTimeout(() => {
          navigate('/matches');
        }, 1500);
      }
    } catch (error) {
      logger.error('Failed to save compatibility answer', error as Error, { questionId: currentQuestion.id });
      setIsSubmitting(false);
      alert('Failed to save answer. Please try again.');
    }
  };

  const getProgress = () => {
    const total = COMPATIBILITY_QUESTIONS.length;
    const answered = answers.size;
    return { answered, total, percentage: (answered / total) * 100 };
  };

  const progress = getProgress();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentQuestion && answers.size === COMPATIBILITY_QUESTIONS.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">All Questions Complete!</h2>
          <p className="text-gray-600 mb-6">Your compatibility profile is ready.</p>
          <button
            onClick={() => navigate('/matches')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            View Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-icy-100 via-white to-icy-200">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-icy-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to leave? Your progress will be saved.')) {
              navigate('/matches');
            }
          }}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-dark text-lg">Known Dating</h1>
          <p className="text-xs text-gray-500">
            {progress.answered} of {progress.total} questions answered
          </p>
        </div>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => {
          if (message.type === 'category') {
            return (
              <div key={index} className="text-center my-6">
                <div className="inline-block bg-primary/10 px-4 py-2 rounded-full">
                  <p className="text-sm font-semibold text-primary">
                    {message.content.split(' - ')[0]}
                  </p>
                  <p className="text-xs text-gray-600">{message.content.split(' - ')[1]}</p>
                </div>
              </div>
            );
          }

          if (message.type === 'question') {
            const question = COMPATIBILITY_QUESTIONS.find(q => q.id === message.questionId);
            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="bg-white rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm">
                    <p className="text-dark text-base leading-relaxed mb-2">
                      {message.content}
                    </p>
                    {question && (
                      <p className="text-xs text-gray-500 italic">
                        Why this matters: {question.whyThisMatters}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          if (message.type === 'answer') {
            return (
              <div key={index} className="flex justify-end">
                <div className="max-w-[85%]">
                  <div className="bg-primary text-white rounded-2xl rounded-br-sm px-6 py-4 shadow-sm">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* Typing indicator or next question preview */}
        {isSubmitting && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-6 py-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {currentQuestion && !isSubmitting && (
        <div className="bg-white/90 backdrop-blur-sm border-t border-icy-200 px-4 py-3 flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }} className="flex gap-2">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
            />
            <button
              type="submit"
              disabled={!currentAnswer.trim() || isSubmitting}
              className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
