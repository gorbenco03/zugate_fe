export async function handleSubmit(
    file: File | null,
    quizQuestions: string,
    responsesPerQuestion: string,
    studentsPresent: string
  ) {
    if (!file || !quizQuestions || !responsesPerQuestion || !studentsPresent) {
      console.error("All fields are required.");
      return;
    }
  
    const formData = new FormData();
    formData.append("pdf", file);  // Ensure the key here matches the backend's expected name
    formData.append("quizQuestions", quizQuestions);
    formData.append("responsesPerQuestion", responsesPerQuestion);
    formData.append("studentsPresent", studentsPresent);

    try {
      const response = await fetch("https://zugate.study/lessons/:id/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("File and data uploaded successfully:", result);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while uploading the file and data:", error);
    }
  }
  