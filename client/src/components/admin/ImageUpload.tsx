import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, UploadCloud } from "lucide-react";
import type { ProductImage } from "../../types";

interface ImageUploadProps {
  onImagesUpload: (images: ProductImage[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({
  onImagesUpload,
  maxImages = 5,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      // For the purposes of this demo, we'll simulate image uploads by creating
      // data URLs.
      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        if (i >= maxImages) {
          setError(`Maximum of ${maxImages} images can be uploaded at once.`);
          break;
        }

        const file = files[i];
        const reader = new FileReader();

        // Create a promise to handle the FileReader async operation
        const imagePromise = new Promise<ProductImage>((resolve) => {
          reader.onload = (e) => {
            const url = e.target?.result as string;
            resolve({
              url,
              alt: file.name,
              isDefault: i === 0, // Make the first image the default
            });
          };
        });

        reader.readAsDataURL(file);
        uploadedImages.push(await imagePromise);
      }

      // Pass the uploaded images back to the parent component
      onImagesUpload(uploadedImages);
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
        <UploadCloud className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          Drag and drop images, or click to select files
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          PNG, JPG, or WEBP up to {maxImages} images, 2MB each
        </p>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("image-upload")?.click();
          }}
          disabled={isUploading}
          className="relative"
        >
          {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isUploading ? "Uploading..." : "Select Images"}
        </Button>
      </div>

      {error && <div className="text-destructive text-sm">{error}</div>}
    </div>
  );
};
