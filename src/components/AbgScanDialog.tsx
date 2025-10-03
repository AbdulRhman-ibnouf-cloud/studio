'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface AbgScanDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onScan: (imageDataUri: string) => void;
}

export function AbgScanDialog({
  isOpen,
  onOpenChange,
  onScan,
}: AbgScanDialogProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'options' | 'camera' | 'preview'>('options');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen && view === 'camera') {
      getCameraPermission();
    } else if (!isOpen) {
      // Cleanup when dialog closes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      // Reset state on close
      setTimeout(() => {
        setView('options');
        setCapturedImage(null);
        setHasCameraPermission(null);
      }, 300);
    }
  }, [isOpen, view, getCameraPermission]);
  
  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUri);
        setView('preview');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setCapturedImage(dataUri);
        setView('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderOptionsView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Scan ABG Report</DialogTitle>
        <DialogDescription>
          Use your camera to take a photo or upload an image of the report.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 py-4">
        <Button variant="outline" size="lg" onClick={() => setView('camera')}>
          <Camera className="mr-2 h-5 w-5" />
          Use Camera
        </Button>
        <Button variant="outline" size="lg" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-5 w-5" />
          Upload Image
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
        />
      </div>
    </>
  );

  const renderCameraView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Camera Scan</DialogTitle>
        <DialogDescription>
          Position the ABG report within the frame and capture.
        </DialogDescription>
      </DialogHeader>
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted my-4">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        {hasCameraPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
             <Alert variant="destructive" className="w-auto">
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          </div>
        )}
        {hasCameraPermission === null && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
             </div>
        )}
      </div>
      <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
        <Button variant="ghost" onClick={() => setView('options')}>Back</Button>
        <Button onClick={handleCapture} disabled={!hasCameraPermission}>
          <Camera className="mr-2 h-4 w-4" />
          Capture
        </Button>
      </DialogFooter>
    </>
  );

  const renderPreviewView = () => (
    <>
       <DialogHeader>
        <DialogTitle>Confirm Image</DialogTitle>
        <DialogDescription>
          Use this image for analysis, or go back to try again.
        </DialogDescription>
      </DialogHeader>
      <div className="my-4">
        <img src={capturedImage!} alt="Captured ABG" className="max-h-[60vh] w-full object-contain rounded-md" />
      </div>
      <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
        <Button variant="ghost" onClick={() => {
            setCapturedImage(null);
            setView(fileInputRef.current?.value ? 'options' : 'camera');
            if(fileInputRef.current) fileInputRef.current.value = '';
        }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retake
        </Button>
        <Button onClick={() => onScan(capturedImage!)}>
           Analyze Image
        </Button>
      </DialogFooter>
    </>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        {view === 'options' && renderOptionsView()}
        {view === 'camera' && renderCameraView()}
        {view === 'preview' && renderPreviewView()}
      </DialogContent>
    </Dialog>
  );
}
