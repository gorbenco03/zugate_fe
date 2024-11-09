import React, { useRef, useState } from 'react';
import { handleFileChange } from '../helpers/select-pdf';
import { isFormComplete } from '../helpers/check-form';

interface InputContainerProps {
  onSubmit: (file: File | null, quizQuestions: string, responsesPerQuestion: string, studentsPresent: string) => void;
}

const InputContainer: React.FC<InputContainerProps> = ({ onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store the selected file and input values
  const [fileName, setFileName] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<string>('');
  const [responsesPerQuestion, setResponsesPerQuestion] = useState<string>('');
  const [studentsPresent, setStudentsPresent] = useState<string>('');

  const onSelectPdfClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="input-container max-w-lg w-full p-6 bg-white rounded-lg shadow-xl border border-purple-300">
      <button
        onClick={onSelectPdfClick}
        className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 focus:outline-none"
      >
        Select PDF
      </button>

      {/* Display the selected file name */}
      {fileName && (
        <p className="mt-2 text-gray-700">
          Selected File: <span className="font-semibold">{fileName}</span>
        </p>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="application/pdf"
        onChange={(e) => handleFileChange(e, setFile, setFileName)}
      />

      {/* Number of Quiz Questions */}
      <div className="mt-4">
        <label className="block text-lg font-medium text-purple-600 mb-2">
          Number of Quiz Questions:
          <input
            type="number"
            value={quizQuestions}
            onChange={(e) => setQuizQuestions(e.target.value)}
            placeholder="Enter number of questions"
            className="mt-1 block w-full p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Responses per Question */}
      <div className="mt-4">
        <label className="block text-lg font-medium text-purple-600 mb-2">
          Responses per Question:
          <input
            type="number"
            value={responsesPerQuestion}
            onChange={(e) => setResponsesPerQuestion(e.target.value)}
            placeholder="Enter number of responses"
            className="mt-1 block w-full p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Number of Students Present */}
      <div className="mt-4">
        <label className="block text-lg font-medium text-purple-600 mb-2">
          Number of Students Present:
          <input
            type="number"
            value={studentsPresent}
            onChange={(e) => setStudentsPresent(e.target.value)}
            placeholder="Enter number of students"
            className="mt-1 block w-full p-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </label>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={() => onSubmit(file, quizQuestions, responsesPerQuestion, studentsPresent)}
          className={`w-full py-2 px-4 rounded-md text-white focus:outline-none ${isFormComplete(file, quizQuestions, responsesPerQuestion, studentsPresent)
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isFormComplete(file, quizQuestions, responsesPerQuestion, studentsPresent)} // Disable the button if the form is not complete
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default InputContainer;
