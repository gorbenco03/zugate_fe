export function isFormComplete(
    file: File | null,
    quizQuestions: string,
    responsesPerQuestion: string,
    studentsPresent: string
  ): boolean {
    return !!(file && quizQuestions && responsesPerQuestion && studentsPresent);
  }
  