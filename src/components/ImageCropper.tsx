"use client";
import { useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

interface ImageCropperProps {
  onCrop: (blob: Blob) => void;
  onClose: () => void;
}

export default function ImageCropper({ onCrop, onClose }: ImageCropperProps) {
  const [image, setImage] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((blob: Blob) => {
        onCrop(blob);
        onClose();
      }, "image/jpeg", 0.9);
    }
  };

  if (image) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-4">
          <h3 className="text-xl font-bold mb-4">Recadrer l'image</h3>
          <Cropper
            src={image}
            style={{ height: 400, width: "100%" }}
            initialAspectRatio={16 / 9}
            aspectRatio={16 / 9}
            guides={true}
            ref={cropperRef}
            viewMode={1}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={onClose} className="btn-secondary">Annuler</button>
            <button onClick={handleCrop} className="btn-primary">Appliquer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload size={24} className="text-gray-400" />
        <p className="text-sm text-gray-500">Cliquer pour choisir une image</p>
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
}