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
