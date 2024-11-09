import React, { useState } from 'react';
import InputContainer from './input-container';

const AddQuizButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Add Quiz
        {/* DIMA lectia, ora si etc o sa vina cumva de la user autentificat propriu zis*/}
      </button>

      {/* Modal/Pop-up */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
            >
              X
            </button>
            <InputContainer onSubmit={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddQuizButton;
