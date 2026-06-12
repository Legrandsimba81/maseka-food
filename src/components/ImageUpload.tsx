"use client";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({ onUpload, onRemove, currentImage, label = "Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setPreview(data.url);
        onUpload(data.url);
        toast.success("Image uploadée");
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
    setUploading(false);
  };

  const handleRemove = () => {
    setPreview("");
    if (onRemove) onRemove();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Aperçu" className="h-32 w-auto rounded-lg object-cover border" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload size={24} className="text-gray-400" />
            <p className="text-sm text-gray-500">Cliquer pour uploader</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}
      {uploading && <p className="text-sm text-gray-500">Envoi en cours...</p>}
    </div>
  );
}