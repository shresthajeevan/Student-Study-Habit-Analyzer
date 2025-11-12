import { useState, useRef } from "react";
import { Upload, X, Sparkles, FileText } from "lucide-react";
import { uploadFiles } from "../api/upload";

const Button = ({ children, onClick, className, type = "button", disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const UploadNotes = ({ showToast }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFiles = (newFiles) => {
    const filesArray = Array.from(newFiles).map((file) =>
      Object.assign(file, {
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      })
    );
    setFiles((prev) => [...prev, ...filesArray]);
  };

  const removeFile = (i) => {
    const fileToRemove = files[i];
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
    setFiles(files.filter((_, idx) => idx !== i));
  };

  const handleUpload = async () => {
    if (!files.length) {
      showToast?.("Please select files to upload", "error");
      return;
    }

    try {
      setUploading(true);
      const response = await uploadFiles(files);
      
      showToast?.(`Successfully uploaded ${response.files.length} file(s)!`);
      
      // Clean up previews and clear files
      files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      setFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      showToast?.(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50"
      style={{ marginLeft: "250px", overflow: "hidden" }}
    >
      <div className="flex flex-col lg:flex-row gap-8 w-[90%] h-[85%]">
        {/* Upload Panel */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl p-8 gap-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 border-b border-gray-200 pb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h1 className="text-3xl font-bold text-gray-800">Upload Study Notes</h1>
            <p className="text-gray-600 text-sm text-center">
              Turn your notes into AI-powered quizzes instantly
            </p>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center border-2 border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition cursor-pointer gap-2"
          >
            <Upload className="w-14 h-14 text-gray-400 mb-2" />
            <h2 className="text-lg font-medium text-gray-700">Drag & Drop Files Here</h2>
            <p className="text-gray-500 text-sm">or click to browse</p>
            <p className="text-gray-400 text-xs mt-1">Supported: PDF, TXT, Images</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.md,image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Upload Button */}
          <div className="flex justify-center mt-4">
            <Button onClick={handleUpload} disabled={!files.length || uploading}>
              {uploading ? "Uploading..." : `Upload ${files.length > 0 ? `(${files.length})` : ""}`}
            </Button>
          </div>
        </div>

        {/* Right Side: Preview + Info */}
        <div className="flex flex-col gap-6 w-[40%]">
          {/* Preview Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Your Uploaded Files</h2>
            {files.length === 0 ? (
              <p className="text-gray-500 text-sm">No files selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="relative flex flex-col items-center p-1 border border-gray-200 rounded hover:shadow-lg transition transform hover:scale-105"
                  >
                    {f.preview ? (
                      <img
                        src={f.preview}
                        alt={f.name}
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                    ) : (
                      <FileText className="w-10 h-10 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-700 text-center max-w-[90px] break-words mt-1">
                      {f.name}
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 flex flex-col gap-4">
            <FileText className="w-14 h-14 text-gray-500" />
            <h2 className="text-2xl font-semibold text-gray-800">Why Upload Notes?</h2>
            <ul className="text-gray-700 space-y-2 text-base">
              <li>📘 Generate interactive quizzes from your notes</li>
              <li>⚡ Summarize and extract key ideas quickly</li>
              <li>🎯 Enhance your learning with smart insights</li>
            </ul>
            <p className="text-sm text-gray-600">
              Your files stay private and secure — used only for quiz generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;