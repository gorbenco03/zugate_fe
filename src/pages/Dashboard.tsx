import React, { useState, useEffect, useContext } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Upload, BookOpen, BarChart2, CheckCircle, XCircle, X, Save, Edit2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

interface Question {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  questions: Question[];
  approved: boolean;
}

interface QuizStatistics {
  questionId: string;
  questionText: string;
  correct: number;
  incorrect: number;
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
  quizzes: string[]; // Changed from optional to required with empty array as default
  pdfPath?: string;
}

interface QuizUploadConfig {
  numQuestions: number;
  numAnswers: number;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [statistics, setStatistics] = useState<QuizStatistics[]>([]);
  const { token } = useContext(AuthContext);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [uploadConfig, setUploadConfig] = useState<QuizUploadConfig>({
    numQuestions: 5,
    numAnswers: 4,
  });
  const [showUploadConfig, setShowUploadConfig] = useState(false);

  const formatDateForAPI = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:5001/api/teacher/lessons?date=${formatDateForAPI(selectedDate)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Nu s-au putut încărca lecțiile');
        const data = await response.json();
        setLessons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea lecțiilor');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [selectedDate, token]);

  // Fetch quizzes when a lesson is selected
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedLesson) return;
      
      try {
        const response = await fetch(
          `http://localhost:5001/api/teacher/lessons/${selectedLesson._id}/quizzes`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Nu s-au putut încărca quiz-urile');
        const data = await response.json();
        setQuizzes(data.quizzes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea quiz-urilor');
      }
    };

    fetchQuizzes();
  }, [selectedLesson, token]);

  const handlePDFUpload = async (lessonId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('numQuestions', uploadConfig.numQuestions.toString());
      formData.append('numAnswers', uploadConfig.numAnswers.toString());

      const response = await fetch(
        `http://localhost:5001/api/teacher/lessons/${lessonId}/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Eroare la încărcarea PDF-ului');

      const updatedLessonResponse = await fetch(
        `http://localhost:5001/api/teacher/lessons/${lessonId}/quizzes`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!updatedLessonResponse.ok) throw new Error('Nu s-au putut actualiza quiz-urile');
      
      const data = await updatedLessonResponse.json();
      setQuizzes(data.quizzes);
      setShowUploadConfig(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea PDF-ului');
    }
  };

  const handleUpdateQuiz = async (quizId: string, questions: Question[]) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/teacher/quizzes/${quizId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questions }),
        }
      );

      if (!response.ok) throw new Error('Nu s-a putut actualiza quiz-ul');

      const { quiz } = await response.json();
      setQuizzes(quizzes.map(q => q._id === quizId ? quiz : q));
      setEditingQuiz(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la actualizarea quiz-ului');
    }
  };

  const handleApproveQuiz = async (quizId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/teacher/quizzes/${quizId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Nu s-a putut aproba quiz-ul');

      // Update quizzes list
      setQuizzes(quizzes.map(quiz => 
        quiz._id === quizId ? { ...quiz, approved: true } : quiz
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la aprobarea quiz-ului');
    }
  };

  const handleViewStatistics = async (quizId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/teacher/quizzes/${quizId}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Nu s-au putut încărca statisticile');

      const data = await response.json();
      setStatistics(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea statisticilor');
    }
  };

  const renderUploadConfig = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Configurare Quiz</h3>
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
              Număr de întrebări
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
              Număr de răspunsuri per întrebare
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

          <label className="flex items-center gap-2 w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors justify-center">
            <Upload className="w-5 h-5" />
            <span>Selectează PDF</span>
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
  );

  const renderQuizEditor = (quiz: Quiz) => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Editare Quiz</h4>
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
                Întrebarea {qIndex + 1}
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
  );


  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dashboard Professor</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-8">
          <div className="w-2/3 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {selectedLesson ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedLesson.title}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        {selectedLesson.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {/* <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                        <Upload className="w-5 h-5" />
                        <span>Încarcă PDF</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handlePDFUpload(selectedLesson._id, file);
                            }
                          }}
                        />
                      </label> */}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Ora</p>
                      <p className="text-lg font-medium">{selectedLesson.time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Clasa</p>
                      <p className="text-lg font-medium">{selectedLesson.class.name}</p>
                    </div>
                  </div>

                 
                 {quizzes.length > 0 && (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quiz-uri</h3>
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span className="font-medium">
                    Quiz ({quiz.questions.length} întrebări)
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
                        className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        Aprobă
                      </button>
                      <button
                        onClick={() => setEditingQuiz(quiz)}
                        className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
                      >
                     <Edit2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setSelectedQuiz(quiz);
                  handleViewStatistics(quiz._id);
                }}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {editingQuiz?._id === quiz._id && renderQuizEditor(editingQuiz)}
          {selectedQuiz?._id === quiz._id && statistics.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Statistici</h4>
                <button
                  onClick={() => {
                    // Logica pentru generarea sugestiilor va fi implementată mai târziu
                    console.log('Generare sugestii pentru quiz:', quiz._id);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>Generează Sugestii</span>
                </button>
              </div>
              {statistics.map((stat, index) => (
                <div key={stat.questionId} className="mb-2">
                  <p className="text-sm text-gray-600">
                    Întrebarea {index + 1}: {stat.questionText}
                  </p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-green-600">
                      Corecte: {stat.correct}
                    </span>
                    <span className="text-red-600">
                      Incorecte: {stat.incorrect}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

<div className="flex gap-2">
      <button
        onClick={() => setShowUploadConfig(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
      >
        <Upload className="w-5 h-5" />
        <span>Încarcă PDF</span>
      </button>
    </div>

    {showUploadConfig && renderUploadConfig()}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">
                    Selectați o lecție din calendar pentru a vedea detaliile
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="w-1/3 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedDate(subDays(selectedDate, 1));
                  setSelectedLesson(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro })}
              </h2>
              
              <button
                onClick={() => {
                  setSelectedDate(addDays(selectedDate, 1));
                  setSelectedLesson(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Se încarcă lecțiile...</p>
                </div>
              ) : lessons.length > 0 ? (
                lessons.map((lesson) => (
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
                      <span className="font-medium text-gray-900">
                        {lesson.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {lesson.time}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Clasa {lesson.class.name}
                      {lesson.quizzes?.length > 0 && (
                        <span className="ml-2 inline-flex items-center">
                        <BookOpen className="w-4 h-4 text-green-500" />
                        <span className="ml-1 text-xs text-green-600">
                          {lesson.quizzes.length} quiz{lesson.quizzes.length !== 1 ? '-uri' : ''}
                        </span>
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nu sunt lecții programate pentru această zi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;