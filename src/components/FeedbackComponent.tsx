import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface FeedbackComponentProps {
  lessonId: string;
}

// Simplified interface structure based on actual API response
interface FeedbackResponse {
  lesson: string;
  summary: string;  // Changed to expect direct string instead of complex object
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ lessonId }) => {
  const { token } = useContext(AuthContext);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!lessonId) {
        setError('Lesson ID is missing.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        setSummary('');

        const response = await fetch(`https://zugate.study/api/teacher/feedback?lessonId=${lessonId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404 
              ? 'No feedback available for this lesson.' 
              : 'Failed to fetch feedback'
          );
        }

        const data: FeedbackResponse = await response.json();
        
        // Check if summary exists and is a string
        if (typeof data.summary === 'string' && data.summary.trim()) {
          setSummary(data.summary);
        } else {
          setError('Feedback summary is unavailable.');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [lessonId, token]);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Feedback Despre Lecție</h2>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      ) : summary ? (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-xl font-semibold mb-2">Sumar Feedback:</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
        </div>
      ) : (
        <p className="text-gray-500">Nu există feedback disponibil pentru această lecție.</p>
      )}
    </div>
  );
};

export default FeedbackComponent;