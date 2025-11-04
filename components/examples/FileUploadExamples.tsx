// Example client-side implementation for file uploads using Convex R2 component

'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUploadFile } from '@convex-dev/r2/react';
import Image from 'next/image';

export function FileUploadExample() {
  const [uploading, setUploading] = useState(false);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);

  // Use the R2 hook for file upload - pass the files module (single entry point)
  const uploadFile = useUploadFile(api.files.index);

  // Get the file URL using query
  const fileUrl = useQuery(api.files.queries.index.getFileUrl, uploadedKey ? { key: uploadedKey } : 'skip');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file using the R2 component
      const key = await uploadFile(file);
      setUploadedKey(key);

      console.log('File uploaded successfully with key:', key);
    } catch (error) {
      console.error('Upload failed:', error);

      // Show more detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        alert(`Upload failed: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        alert('Upload failed with unknown error');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">File Upload Example (R2 Component)</h2>

      <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="mb-4" />

      {uploading && <p className="text-blue-600">Uploading...</p>}

      {uploadedKey && fileUrl && (
        <div className="mt-4">
          <p className="text-green-600 mb-2">Upload successful!</p>
          <p className="text-sm text-gray-600 mb-2">Key: {uploadedKey}</p>
          <Image src={fileUrl} alt="Uploaded file" width={300} height={200} className="max-w-xs h-auto border rounded" />
        </div>
      )}
    </div>
  );
}

// Example for product creation with images using R2
export function ProductCreateExample() {
  const [productImages, setProductImages] = useState<string[]>([]);

  const uploadFile = useUploadFile(api.files.index);

  const uploadProductImage = async (file: File): Promise<string> => {
    const key = await uploadFile(file);
    return key;
  };

  const handleCreateProduct = async () => {
    try {
      // Note: You would need to implement a createProduct mutation that accepts image keys
      // and automatically computes URLs using the buildPublicUrl helper, following the R2 component pattern
      console.log('Product images (keys):', productImages);
      console.log('Creating product with images...');
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    try {
      const uploadPromises = files.map(uploadProductImage);
      const keys = await Promise.all(uploadPromises);

      setProductImages((prev) => [...prev, ...keys]);
    } catch (error) {
      console.error('Failed to upload images:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create Product with Images (R2 Component)</h2>

      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="mb-4" />

      {productImages.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Product Images:</h3>
          <div className="grid grid-cols-3 gap-2">
            {productImages.map((key, index) => (
              <div key={index} className="relative">
                <ProductImage imageKey={key} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCreateProduct}
        disabled={productImages.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Create Product
      </button>
    </div>
  );
}

// Separate component to handle individual image display
function ProductImage({ imageKey, index }: { imageKey: string; index: number }) {
  const imageUrl = useQuery(api.files.queries.index.getFileUrl, { key: imageKey });

  return (
    <>
      {imageUrl && <Image src={imageUrl} alt={`Product ${index + 1}`} width={100} height={96} className="w-full h-24 object-cover border rounded" />}
      <p className="text-xs text-gray-500 mt-1">Key: {imageKey}</p>
    </>
  );
}
