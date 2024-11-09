import React from 'react';
import './App.css';
import AddQuizButton from './containers/add-quiz-butt'; // Import the AddQuizButton component

function App() {
  return (
    <div className="App bg-white min-h-screen py-12 flex justify-center items-center">
      {/* Use AddQuizButton to trigger the modal */}
      <AddQuizButton />
    </div>
  );
}

export default App;
