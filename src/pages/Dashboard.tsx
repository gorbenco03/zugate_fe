import React, { useState, useEffect, useContext } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Upload, BookOpen, BarChart2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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
  quiz?: string;
}

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useContext(AuthContext);

  // Funcție pentru a formata data pentru API
  const formatDateForAPI = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch lecții pentru data selectată
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

        if (!response.ok) {
          throw new Error('Nu s-au putut încărca lecțiile');
        }

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

  // Funcție pentru încărcarea PDF-ului
  const handlePDFUpload = async (lessonId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);

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

      if (!response.ok) {
        throw new Error('Eroare la încărcarea PDF-ului');
      }

      // Reîmprospătăm datele lecției
      const updatedLessonResponse = await fetch(
        `http://localhost:5001/api/teacher/lessons/${lessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!updatedLessonResponse.ok) {
        throw new Error('Nu s-au putut actualiza datele lecției');
      }

      const updatedLesson = await updatedLessonResponse.json();
      setSelectedLesson(updatedLesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea PDF-ului');
    }
  };

  // Navigation handlers
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
    setSelectedLesson(null);
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
    setSelectedLesson(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Dashboard Professor</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-8">
          {/* Zona pentru detalii lecție (2/3) */}
          <div className="w-2/3 bg-white rounded-lg shadow-sm p-6">
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
                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                      <Upload className="w-5 h-5" />
                      {/* <span>Încarcă PDF</span> */}
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
                    </label>
                    {selectedLesson.quiz && (
                      <button
                        onClick={() => {
                          // Adaugă logica pentru vizualizarea statisticilor quiz-ului
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <BarChart2 className="w-5 h-5" />
                        <span>Vezi Statistici</span>
                      </button>
                    )}
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
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">
                  Selectați o lecție din calendar pentru a vedea detaliile
                </p>
              </div>
            )}
          </div>

          {/* Calendar și ore (1/3) */}
          <div className="w-1/3 bg-white rounded-lg shadow-sm p-6">
            {/* Header Calendar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousDay}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ro })}
              </h2>
              
              <button
                onClick={handleNextDay}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Lista ore */}
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
                      {lesson.quiz && (
                        <span className="ml-2 inline-flex items-center">
                          <BookOpen className="w-4 h-4 text-green-500" />
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