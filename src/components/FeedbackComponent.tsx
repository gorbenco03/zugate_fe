// src/components/FeedbackComponent.tsx

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface FeedbackResponse {
  lesson: string;
  summary: SummaryObject;
}

interface SummaryObject {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  system_fingerprint: string;
}

interface Choice {
  index: number;
  message: Message;
  logprobs: any;
  finish_reason: string;
}

interface Message {
  role: string;
  content: string;
  refusal: any;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details: {
    cached_tokens: number;
    audio_tokens: number;
  };
  completion_tokens_details: {
    reasoning_tokens: number;
    audio_tokens: number;
    accepted_prediction_tokens: number;
    rejected_prediction_tokens: number;
  };
}

interface FeedbackComponentProps {
  lessonId: string;
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
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch feedback');
        }

        const data: FeedbackResponse = await response.json();
console.log(data.summary.choices[0].message.content)
        // Verifică structura răspunsului și extrage textul sumarului
        if (
          data.summary &&
          data.summary.choices &&
          data.summary.choices.length > 0 &&
          data.summary.choices[0].message &&
          data.summary.choices[0].message.content
        ) {
          setSummary(data.summary.choices[0].message.content);
        } else {
          setError('Feedback summary is unavailable.');
        }
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        setError(err.message || 'Failed to fetch feedback');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [lessonId, token]);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Feedback Despre Profesori</h2>

      {loading && <p className="text-gray-500">Se încarcă...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="text-xl font-semibold mb-2">Sumar Feedback:</h3>
          <p className="text-gray-800">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackComponent;