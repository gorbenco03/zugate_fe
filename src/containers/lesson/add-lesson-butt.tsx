import React, { useState } from 'react';
import LessonContainer from './lesson-container';

const AddLessonButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLessonSubmit = (lessonData: any) => {
    console.log('Lesson Data Submitted:', lessonData);
    // You can send this data to your backend or handle it here
    closeModal(); // Close the modal after submitting
  };

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Add New Lesson
      </button>

      {/* Modal/Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
            >
              X
            </button>
            <LessonContainer onSubmit={handleLessonSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLessonButton;
