/** Per-image upload slot used by VehicleFormClient and SortableImageGrid. */
export type ImageSlot = {
  /** Stable local ID for React keying and dnd-kit */
  id: string;
  /** blob:// during upload, https:// once persisted */
  previewUrl: string;
  /** Set to the R2 public URL after a successful upload */
  uploadedUrl?: string;
  /** R2 object key — set only for admin-uploaded files; null for pre-existing images */
  r2Key?: string;
  uploading: boolean;
  error?: string;
};

/** Per-clip upload slot for the "Video Upload" section (uploaded MP4s only). */
export type VideoSlot = {
  /** Stable local ID for React keying */
  id: string;
  /** File name shown while uploading / on error */
  filename: string;
  /** Size in bytes — counted toward the 30 MB per-vehicle cap */
  sizeBytes: number;
  /** blob:// during upload, https:// once persisted */
  previewUrl: string;
  /** Set to the R2 public URL after a successful upload */
  uploadedUrl?: string;
  /** R2 object key — set only for admin-uploaded files; null for pre-existing videos */
  r2Key?: string;
  mimeType?: string;
  uploading: boolean;
  error?: string;
};
