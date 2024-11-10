import React, { useState, useEffect, useContext } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  BookOpen,
  BarChart2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Edit2,
  MessageSquare,
  Loader2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card';
import { Alert, AlertDescription } from '../components/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import PresenceChecker from '../components/feedback'; 
import { useNavigate } from 'react-router-dom';
// Types
interface Question {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  questions: Question[];
  approved: boolean;
  originalText?: string;
}

interface CommonWrongAnswer {
  answer: string;
  count: number;
}

interface QuizStatistics {
  questionId: string;
  questionText: string;
  correct: number;
  incorrect: number;
  commonWrongAnswers: CommonWrongAnswer[];
}

interface AnalysisPoint {
  point: string;
  description: string;
}

interface QuizAnalysis {
  averageScore: number;
  totalStudents: number;
  analysisPoints: AnalysisPoint[];
  recommendedFocus: string[];
}

interface Lesson {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  class: {
    _id: string;
    name: string;
  };
  quizzes: string[];
  pdfPath?: string;
}

interface UploadConfig {
  numQuestions: number;
  numAnswers: number;
}

// API Service
const API_BASE_URL = 'http://localhost:5001/api/teacher';

const apiService = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  getLessons: (date: string) =>
    apiService.fetchWithAuth(`/lessons?date=${date}`),

  getQuizzes: (lessonId: string) =>
    apiService.fetchWithAuth(`/lessons/${lessonId}/quizzes`),

  updateQuiz: (quizId: string, questions: Question[]) =>
    apiService.fetchWithAuth(`/quizzes/${quizId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    }),

  approveQuiz: (quizId: string) =>
    apiService.fetchWithAuth(`/quizzes/${quizId}/approve`, {
      method: 'POST',
    }),

  // Metoda existentă pentru obținerea analizei
  getQuizAnalysis: (quizId: string) =>
    apiService.fetchWithAuth(`/quizzes/${quizId}/analyze`),

  // Metodă nouă pentru generarea analizei
  generateQuizAnalysis: (quizId: string) =>
    apiService.fetchWithAuth(`/quizzes/${quizId}/generate_analyze`, {
      method: 'POST',
    }),

  uploadPDF: (lessonId: string, file: File, config: UploadConfig) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('numQuestions', config.numQuestions.toString());
    formData.append('numAnswers', config.numAnswers.toString());

    return apiService.fetchWithAuth(`/lessons/${lessonId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },
};
// Components
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
  </div>
);

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const QuizAnalysisComponent: React.FC<{ quizId: string }> = ({ quizId }) => {
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const data = await apiService.getQuizAnalysis(quizId);
      setAnalysis(data.report);
    } catch (err) {
      if (err instanceof Error && err.message.includes('404')) {
        // Dacă raportul nu există, îl vom genera
        return false;
      }
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
    return true;
  };

  const generateAnalysis = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await apiService.generateQuizAnalysis(quizId);
      // După generare, încercăm să obținem analiza
      const success = await fetchAnalysis();
      if (!success) {
        throw new Error('Failed to generate analysis');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const initializeAnalysis = async () => {
      const exists = await fetchAnalysis();
      if (!exists && !error) {
        // Dacă raportul nu există și nu avem erori, începem generarea
        await generateAnalysis();
      }
    };

    if (quizId) {
      initializeAnalysis();
    }
  }, [quizId]);

  if (loading || isGenerating) return <LoadingSpinner />;
  if (error) return (
    <div className="space-y-4">
      <ErrorAlert message={error} />
      <button
        onClick={generateAnalysis}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <BarChart2 className="w-4 h-4" />
        )}
        Regenerate Analysis
      </button>
    </div>
  );
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quiz Analysis</h3>
        <button
          onClick={generateAnalysis}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BarChart2 className="w-4 h-4" />
          )}
          Refresh Analysis
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-600">Average Score</p>
              <p className="text-2xl font-bold text-indigo-700">
                {analysis.averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Total Students</p>
              <p className="text-2xl font-bold text-green-700">
                {analysis.totalStudents}
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: 'Average', value: analysis.averageScore },
                  { name: 'Maximum', value: 100 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.analysisPoints.map((point, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-indigo-600">{point.point}</h4>
                <p className="mt-1 text-gray-600">{point.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.recommendedFocus.map((focus, index) => (
              <div key={index} className="p-4 bg-orange-50 rounded-lg">
                <div className="flex gap-2 items-start">
                  <MessageSquare className="w-5 h-5 text-orange-500 mt-0.5" />
                  <p className="text-orange-800">{focus}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadConfig, setShowUploadConfig] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig>({
    numQuestions: 5,
    numAnswers: 4,
  });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Adaugă această funcție pentru gestionarea logout-ului
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const data = await apiService.getLessons(formattedDate);
        setLessons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedDate]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedLesson) return;
      
      try {
        const data = await apiService.getQuizzes(selectedLesson._id);
        setQuizzes(data.quizzes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quizzes');
      }
    };

    fetchQuizzes();
  }, [selectedLesson]);

  const handlePDFUpload = async (lessonId: string, file: File) => {
    try {
      await apiService.uploadPDF(lessonId, file, uploadConfig);
      const data = await apiService.getQuizzes(lessonId);
      setQuizzes(data.quizzes);
      setShowUploadConfig(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
    }
  };

  const handleUpdateQuiz = async (quizId: string, questions: Question[]) => {
    try {
      const updatedQuiz = await apiService.updateQuiz(quizId, questions);
      setQuizzes(quizzes.map(q => q._id === quizId ? updatedQuiz : q));
      setEditingQuiz(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quiz');
    }
  };

  const handleApproveQuiz = async (quizId: string) => {
    try {
      await apiService.approveQuiz(quizId);
      setQuizzes(quizzes.map(quiz => 
        quiz._id === quizId ? { ...quiz, approved: true } : quiz
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve quiz');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              Deconectare
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorAlert message={error} />}

        <div className="flex gap-8">
          {/* Left Side - Calendar and Lessons */}
          <div className="w-1/3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h2 className="text-lg font-semibold">
                    {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro })}
                  </h2>
                  
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson) => (
                      <button
                        key={lesson._id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${
                          selectedLesson?._id === lesson._id
                            ? 'bg-indigo-50 border-2 border-indigo-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{lesson.title}</span>
                          <span className="text-sm text-gray-500">{lesson.time}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {lesson.class.name}
                          {lesson.quizzes?.length > 0 && (
                            <span className="ml-2 inline-flex items-center">
                              <BookOpen className="w-4 h-4 text-green-500" />
                              <span className="ml-1">
                                {lesson.quizzes.length} quiz(zes)
                              </span>
                            </span>
                            
                          )}
                          
                        </div>
                      </button>
                      
                    ))}
                  </div>
                  
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Lesson Details and Quizzes */}
          <div className="w-2/3">
            <Card>
              <CardContent>
                {selectedLesson ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                      <p className="text-gray-500">{selectedLesson.description}</p>
                      
                    </div>
                    
                    {/* Quiz List */}
                    {quizzes.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Quizzes</h3>
                        <div className="space-y-4">
                          {quizzes.map((quiz) => (
                            <div
                              key={quiz._id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5 text-indigo-500" />
                                  <span className="font-medium">
                                    Quiz ({quiz.questions.length} questions)
                                  </span>
                                  {quiz.approved ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {!quiz.approved && (
                                    <>
                                      <button
                                        onClick={() => handleApproveQuiz(quiz._id)}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => setEditingQuiz(quiz)}
                                        className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setSelectedQuiz(quiz)}
                                    className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                                  >
                                    <BarChart2 className="w-4 h-4" />
                                    Analysis
                                  </button>
                                </div>
                              </div>

                              {/* Quiz Editor */}
                              {editingQuiz?._id === quiz._id && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-medium">Edit Quiz</h4>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleUpdateQuiz(quiz._id, quiz.questions)}
                                        className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                      >
                                        <Save className="w-5 h-5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingQuiz(null)}
                                        className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {quiz.questions.map((question, qIndex) => (
                                      <div key={qIndex} className="p-4 bg-white rounded border">
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Question {qIndex + 1}
                                          </label>
                                          <input
                                            type="text"
                                            value={question.questionText}
                                            onChange={(e) => {
                                              const newQuestions = [...quiz.questions];
                                              newQuestions[qIndex] = {
                                                ...question,
                                                questionText: e.target.value,
                                              };
                                              setEditingQuiz({ ...quiz, questions: newQuestions });
                                            }}
                                            className="w-full p-2 border rounded"
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          {question.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                              <input
                                                type="radio"
                                                checked={question.correctAnswer === option.text}
                                                onChange={() => {
                                                  const newQuestions = [...quiz.questions];
                                                  newQuestions[qIndex] = {
                                                    ...question,
                                                    correctAnswer: option.text,
                                                  };
                                                  setEditingQuiz({ ...quiz, questions: newQuestions });
                                                }}
                                                className="w-4 h-4 text-indigo-600"
                                              />
                                              <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => {
                                                  const newQuestions = [...quiz.questions];
                                                  newQuestions[qIndex].options[oIndex] = {
                                                    text: e.target.value,
                                                  };
                                                  setEditingQuiz({ ...quiz, questions: newQuestions });
                                                }}
                                                className="flex-1 p-2 border rounded"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Quiz Analysis */}
                              {selectedQuiz?._id === quiz._id && (
                                <QuizAnalysisComponent quizId={quiz._id} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload PDF Section */}
                    <div className="mt-6">
                      <button
                        onClick={() => setShowUploadConfig(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload PDF</span>
                      </button>
                    </div>

                    {/* Upload Configuration Modal */}
                    {showUploadConfig && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-96">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Quiz Configuration</h3>
                            <button
                              onClick={() => setShowUploadConfig(false)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Questions
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={uploadConfig.numQuestions}
                                onChange={(e) => setUploadConfig(prev => ({
                                  ...prev,
                                  numQuestions: parseInt(e.target.value) || 5
                                }))}
                                className="w-full p-2 border rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Answers per Question
                              </label>
                              <input
                                type="number"
                                min="2"
                                max="6"
                                value={uploadConfig.numAnswers}
                                onChange={(e) => setUploadConfig(prev => ({
                                  ...prev,
                                  numAnswers: parseInt(e.target.value) || 4
                                }))}
                                className="w-full p-2 border rounded"
                              />
                            </div>

                            <label className="flex items-center gap-2 w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100">
                              <Upload className="w-5 h-5" />
                              <span>Select PDF</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file && selectedLesson) {
                                    handlePDFUpload(selectedLesson._id, file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    <PresenceChecker lessonId={selectedLesson._id} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">
                      Select a lesson from the calendar to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;