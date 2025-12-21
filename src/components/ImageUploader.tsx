/**
 * Image Uploader Component
 *
 * Features:
 * - Upload images to Cloudinary
 * - Image preview before upload
 * - Drag & drop support
 * - Progress indication
 * - ShadCN UI components
 * - React Query integration
 *
 * Following DEVELOPMENT_RULES.md: Reusable component, centralized hooks
 */

import { memo, useState, useCallback, useRef } from "react";
import { useUploadImage } from "../hooks/useRecipeImages";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  onUploadComplete?: (imageUrl: string) => void;
  folder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

/**
 * Image Uploader Component (Memoized for performance)
 *
 * Handles image uploads to Cloudinary
 */
const ImageUploader = memo(({
  onUploadComplete,
  folder,
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useUploadImage();

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      // Validate file type
      if (!acceptedTypes.includes(selectedFile.type)) {
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize * 1024 * 1024) {
        return;
      }

      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    },
    [acceptedTypes, maxSize]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = useCallback(() => {
    if (!file) return;

    uploadImage.mutate(
      { imageFile: file, folder },
      {
        onSuccess: (data) => {
          if (onUploadComplete) {
            onUploadComplete(data.imageUrl);
          }
          setFile(null);
          setPreview(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  }, [file, folder, uploadImage, onUploadComplete]);

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`glow-card border-purple-500/30 transition-all ${
          isDragging ? "border-purple-500 bg-purple-500/10" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {!preview ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Upload className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">Drag & drop an image here</p>
                <p className="text-xs text-gray-400">or</p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="glow-button"
                  aria-label="Browse files to upload image"
                >
                  Browse Files
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Max size: {maxSize}MB • Accepted: JPEG, PNG, WebP, GIF
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedTypes.join(",")}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                  onClick={handleRemove}
                  aria-label="Remove image preview"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploadImage.isPending}
                  className="glow-button flex-1"
                  aria-label={uploadImage.isPending ? "Uploading image" : "Upload image"}
                >
                  {uploadImage.isPending ? "Uploading..." : "Upload Image"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  aria-label="Cancel image upload"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ImageUploader.displayName = "ImageUploader";

export default ImageUploader;

