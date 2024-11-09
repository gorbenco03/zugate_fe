export function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setFileName: (name: string) => void
  ) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName("");
      console.error("Please select a PDF file.");
    }
  }
  