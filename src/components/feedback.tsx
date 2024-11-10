import React, { useEffect, useState } from 'react';

interface Person {
  id: string;
  name: string;
  grade?: number | null;
  note?: string | null;
}

const PresenceChecker: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [grade, setGrade] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadPeople();
  }, [lessonId]);

  const loadPeople = async () => {
    const response = await fetch(`/api/teacher/lessons/${lessonId}/students`);
    const data = await response.json();
    setPeople(data); // Setăm doar studenții prezenți în stare
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const submitGrades = async () => {
    if (!grade || isNaN(Number(grade))) {
      alert("Introduceți o notă validă.");
      return;
    }

    const grades = selectedIds.map((id) => ({
      studentId: id,
      grade: parseInt(grade),
      note,
    }));

    await fetch(`/api/teacher/lessons/${lessonId}/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grades }),
    });

    loadPeople();
    setGrade('');
    setNote('');
    setSelectedIds([]);
  };

  return (
    <div className="w-full p-5 bg-gradient-to-br from-purple-100 to-purple-50 shadow-lg border border-purple-200 rounded-lg">
      <h2 className="text-lg font-semibold text-purple-700 mb-4">Elevi Prezenți</h2>
      <ul className="list-none p-0 mb-4 max-h-72 overflow-y-auto">
        {people.map((person) => (
          <li
            key={person.id}
            className={`flex items-center p-3 border-b border-purple-100 cursor-pointer rounded-md ${
              selectedIds.includes(person.id) ? 'bg-purple-300 text-white' : 'hover:bg-purple-200'
            }`}
            onClick={() => toggleSelection(person.id)}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(person.id)}
              onChange={() => toggleSelection(person.id)}
              className="mr-3 accent-purple-400"
            />
            <span className="flex-1">{person.name}</span>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Introduceți nota"
          className="w-full p-2 border rounded mb-2 bg-purple-50"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Scrieți notița"
          className="w-full p-2 border rounded bg-purple-50 mb-2 resize-none"
        />
        <button onClick={submitGrades} className="w-full p-2 bg-purple-600 text-white rounded">
          Trimite calificative
        </button>
      </div>
    </div>
  );
};

export default PresenceChecker;