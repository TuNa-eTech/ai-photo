import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  FormControl,
  FormHelperText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  ContentPaste,
  Close,
  Check,
} from '@mui/icons-material';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { fileToBase64, validateImageFile } from '../../utils/imageHelper';

interface EnhancedImageUploadProps {
  onImageSelect: (file: File | string) => void;
  currentImage?: string;
  label?: string;
  helperText?: string;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
  aspectRatios?: Array<{ label: string; value: number }>;
  enableCrop?: boolean;
}

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
};

const EnhancedImageUpload: React.FC<EnhancedImageUploadProps> = ({
  onImageSelect,
  currentImage,
  label = 'Tải lên hình ảnh',
  helperText,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeMB = 5,
  disabled = false,
  aspectRatios = [
    { label: 'Tự do', value: 0 },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '9:16', value: 9 / 16 },
    { label: '3:4', value: 3 / 4 },
  ],
  enableCrop = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [cropImage, setCropImage] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = async (file: File) => {
    setError('');

    const validation = validateImageFile(file, maxSizeMB * 1024 * 1024);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);

      if (enableCrop) {
        setCropImage(base64);
        setShowCropDialog(true);
        setCrop(undefined);
        setCompletedCrop(undefined);
      } else {
        onImageSelect(file);
      }
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file =>
      acceptedFormats.some(format => file.type === format)
    );

    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setError('Please drop a valid image file');
    }
  }, [acceptedFormats, maxSizeMB]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCropComplete = useCallback((crop: PixelCrop) => {
    setCompletedCrop(crop);
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (selectedAspectRatio === 0) {
      setCrop(undefined);
    } else {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, selectedAspectRatio));
    }
  };

  const handleAspectRatioChange = (aspect: number) => {
    setSelectedAspectRatio(aspect);
    if (aspect === 0) {
      setCrop(undefined);
    } else if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const getCroppedImage = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.8);
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob) {
        const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });

        const croppedBase64 = await fileToBase64(croppedFile);
        setPreview(croppedBase64);
        setShowCropDialog(false);

        // Remove focus from confirm button to prevent ARIA warnings
        setTimeout(() => {
          (document.activeElement as HTMLElement)?.blur();
        }, 0);

        // Pass the cropped base64 string to parent for consistency
        onImageSelect(croppedBase64);
      }
    } catch (err) {
      console.error('Crop error:', err);
      setError('Failed to crop image. Please try uploading a new image instead.');
    }
  };

  const handleCropCancel = () => {
    setShowCropDialog(false);
    setCropImage('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setPreview(currentImage || '');

    // Remove focus from crop button to prevent ARIA warnings
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur();
    }, 0);
  };

  const handleRemoveImage = () => {
    setPreview('');
    setCropImage('');
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormControl fullWidth disabled={disabled} error={!!error}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>

      {preview ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            textAlign: 'center',
            position: 'relative',
            bgcolor: 'background.paper',
          }}
        >
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemoveImage}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'background.default',
              },
            }}
          >
            <Close />
          </IconButton>
          {enableCrop && (
            <Button
              onClick={async () => {
                try {
                  // Clear focus from current button to prevent ARIA warnings
                  (document.activeElement as HTMLElement)?.blur();

                  // Convert to base64 if it's a server URL to avoid CORS issues
                  let imageSource = preview;
                  if (preview && !preview.startsWith('data:') && preview.startsWith('http')) {
                    const response = await fetch(preview);
                    const blob = await response.blob();
                    imageSource = await fileToBase64(new File([blob], 'image.jpg', { type: blob.type }));
                  }

                  // Delay dialog opening to ensure focus is cleared
                  setTimeout(() => {
                    setCropImage(imageSource);
                    setShowCropDialog(true);
                    setCrop(undefined);
                    setCompletedCrop(undefined);
                  }, 0);
                } catch (err) {
                  console.error('Error preparing image for crop:', err);
                  setError('Failed to prepare image for cropping. Please try uploading a new image.');
                }
              }}
              sx={{ mt: 1 }}
            >
              Cắt ảnh
            </Button>
          )}
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            p: 4,
            textAlign: 'center',
            border: isDragOver ? '2px dashed' : '2px dashed',
            borderColor: isDragOver ? 'primary.main' : 'grey.300',
            bgcolor: isDragOver ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'primary.main',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          {isUploading ? (
            <CircularProgress size={40} />
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Kéo và thả hình ảnh vào đây
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                hoặc nhấp để chọn file
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Chip
                  icon={<ContentPaste />}
                  label="Ctrl+V để dán"
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Định dạng: {acceptedFormats.join(', ')} • Tối đa: {maxSizeMB}MB
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}

      {helperText && !error && (
        <FormHelperText>{helperText}</FormHelperText>
      )}

      <Dialog
        open={showCropDialog}
        onClose={handleCropCancel}
        maxWidth="lg"
        fullWidth
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle>Cắt ảnh</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {aspectRatios.map((ratio) => (
              <Chip
                key={ratio.value}
                label={ratio.label}
                onClick={() => handleAspectRatioChange(ratio.value)}
                color={selectedAspectRatio === ratio.value ? 'primary' : 'default'}
                variant={selectedAspectRatio === ratio.value ? 'filled' : 'outlined'}
              />
            ))}
          </Box>

          {cropImage && (
            <Box sx={{ position: 'relative', maxHeight: '60vh', overflow: 'auto' }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={handleCropComplete}
                aspect={selectedAspectRatio === 0 ? undefined : selectedAspectRatio}
                style={{ maxWidth: '100%' }}
              >
                <img
                  ref={imgRef}
                  src={cropImage}
                  onLoad={handleImageLoad}
                  alt="Crop target"
                  style={{ maxWidth: '100%' }}
                />
              </ReactCrop>
            </Box>
          )}

          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCropCancel} startIcon={<Close />}>
            Hủy
          </Button>
          <Button
            onClick={handleCropConfirm}
            variant="contained"
            startIcon={<Check />}
            disabled={!completedCrop}
          >
            Xác nhận cắt
          </Button>
        </DialogActions>
      </Dialog>
    </FormControl>
  );
};

export default EnhancedImageUpload;