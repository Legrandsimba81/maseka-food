"use client";
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

interface ImageUploadWithCropProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentImage?: string;
  label?: string;
  aspect?: number;
}

export default function ImageUploadWithCrop({
  onUpload,
  onRemove,
  currentImage,
  label = "Image",
  aspect = 16 / 9,
}: ImageUploadWithCropProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || "");
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropModalOpen(false);
    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", croppedImageBlob, "cropped-image.jpg");
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
      toast.error("Erreur lors du recadrage");
    } finally {
      setUploading(false);
      setImageSrc(null);
    }
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
      {uploading && <p className="text-sm text-gray-500">Envoi en cours...</p>}

      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4">
            <h3 className="text-lg font-semibold mb-4">Recadrer l'image</h3>
            <div className="relative h-64 w-full">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setCropModalOpen(false)} className="btn-secondary">Annuler</button>
              <button onClick={handleCropConfirm} className="btn-primary">Recadrer & uploader</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}