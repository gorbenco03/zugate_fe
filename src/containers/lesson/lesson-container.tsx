import React, { useState } from 'react';

interface LessonFormProps {
    onSubmit: (lessonData: any) => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ onSubmit }) => {
    // State for form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [teacher, setTeacher] = useState('');
    const [className, setClassName] = useState('');
    const [pdfPath, setPdfPath] = useState('');
    const [quiz, setQuiz] = useState('');

    // Handle form submission
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const lessonData = {
            title,
            description,
            date,
            time,
            teacher,
            class: className, // For simplicity, using className here, replace it as needed
            pdfPath,
            quiz,
        };
        onSubmit(lessonData);
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold">Time</label>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

        {/* DIMA all the below will be automatically set by the auth system */}
            {/* <div>
        <label className="block text-sm font-semibold">Teacher (ID)</label>
        <input
          type="text"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">Class (ID)</label>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">PDF Path</label>
        <input
          type="text"
          value={pdfPath}
          onChange={(e) => setPdfPath(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold">Quiz (ID)</label>
        <input
          type="text"
          value={quiz}
          onChange={(e) => setQuiz(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div> */}

            <div className="mt-4">
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Submit
                </button>
            </div>
        </form>
    );
};

export default LessonForm;
