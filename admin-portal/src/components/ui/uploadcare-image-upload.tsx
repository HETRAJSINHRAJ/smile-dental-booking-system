"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./button";
import { FileUploaderMinimal } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";

interface UploadcareImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

interface UploadcareFile {
  status: string;
  cdnUrl?: string | null;
  uuid?: string;
  name?: string;
  size?: number;
  isImage?: boolean;
  mimeType?: string;
  [key: string]: unknown;
}

export function UploadcareImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  disabled = false,
}: UploadcareImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploaderRef = useRef<HTMLElement | null>(null);

  // Get public key from environment
  const publicKey =
    process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "UPLOADCARE_KEY_NOT_SET";

  // Aggressively hide Uploadcare branding
  useEffect(() => {
    const hideBranding = () => {
      // Target all uploadcare elements
      const uploaderElements = document.querySelectorAll(
        "lr-file-uploader-minimal, lr-simple-btn, lr-copyright",
      );

      uploaderElements.forEach((element) => {
        // Access shadow root if it exists
        const shadowRoot = (
          element as HTMLElement & { shadowRoot?: ShadowRoot }
        ).shadowRoot;
        if (shadowRoot) {
          // Find and hide branding elements
          const brandingSelectors = [
            'a[href*="uploadcare"]',
            "[data-powered-by]",
            "lr-copyright",
            ".uc-copyright",
            ".powered-by",
            "footer",
            'div[style*="uploadcare"]',
          ];

          brandingSelectors.forEach((selector) => {
            const elements = shadowRoot.querySelectorAll(selector);
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.display = "none";
              htmlEl.style.visibility = "hidden";
              htmlEl.style.opacity = "0";
              htmlEl.style.height = "0";
              htmlEl.style.overflow = "hidden";
            });
          });

          // Hide any text containing "Powered by"
          const allElements = shadowRoot.querySelectorAll("*");
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (
              htmlEl.textContent?.includes("Powered by") ||
              htmlEl.textContent?.includes("Uploadcare")
            ) {
              htmlEl.style.display = "none";
            }
          });
        }
      });
    };

    // Run immediately and on interval to catch dynamic content
    hideBranding();
    const interval = setInterval(hideBranding, 100);

    // Also run when DOM changes
    const observer = new MutationObserver(hideBranding);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  if (publicKey === "UPLOADCARE_KEY_NOT_SET") {
    return (
      <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Uploadcare is not configured. Please add
          NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY to your .env.local file
        </p>
      </div>
    );
  }

  const handleChangeEvent = (e: unknown) => {
    // Type guard to check if event has the expected structure
    if (!e || typeof e !== "object") return;

    const event = e as {
      allEntries?: unknown[];
      successEntries?: unknown[];
      [key: string]: unknown;
    };

    const files = event.allEntries || event.successEntries || [];

    // Find successfully uploaded files
    const successfulFiles = files.filter((file): file is UploadcareFile => {
      if (!file || typeof file !== "object") return false;
      const f = file as UploadcareFile;
      return f.status === "success";
    });

    if (successfulFiles.length > 0) {
      const fileInfo = successfulFiles[0];
      const cdnUrl = fileInfo.cdnUrl;

      if (
        cdnUrl &&
        typeof cdnUrl === "string" &&
        cdnUrl.startsWith("https://")
      ) {
        console.log("Uploadcare image URL:", cdnUrl);
        onChange(cdnUrl);
        toast.success("Image uploaded successfully");
        setUploading(false);
      } else {
        console.error("Invalid image URL:", cdnUrl);
        toast.error("Invalid image URL received");
        setUploading(false);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value || disabled || uploading) return;
    onChange("");
    toast.success("Image removed");
  };

  const handleFileAdded = (e: unknown) => {
    console.log("File added:", e);
    setUploading(true);
  };

  const handleUploadStart = (e: unknown) => {
    console.log("Upload started:", e);
    setUploading(true);
  };

  const handleUploadProgress = (e: unknown) => {
    console.log("Upload progress:", e);
  };

  const handleFileRemoved = (e: unknown) => {
    console.log("File removed:", e);
    setUploading(false);
  };

  const handleModalOpen = () => {
    console.log("Modal opened");
    setUploading(true);
  };

  const handleModalClose = () => {
    console.log("Modal closed");
    setUploading(false);
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          lr-file-uploader-minimal a[href*="uploadcare"],
          lr-file-uploader-minimal lr-copyright,
          lr-simple-btn a[href*="uploadcare"],
          [class*="powered"],
          [data-powered-by] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            position: absolute !important;
            pointer-events: none !important;
          }
        `,
        }}
      />
      <div className="space-y-4">
        {value ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg border-2 border-border overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded image"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Image failed to load:", value);
                  toast.error("Failed to load image. The URL may be invalid.");
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", value);
                }}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <FileUploaderMinimal
              ref={uploaderRef}
              pubkey={publicKey}
              maxLocalFileSizeBytes={maxSizeMB * 1024 * 1024}
              multiple={false}
              imgOnly={true}
              sourceList="local, url, camera, dropbox, gdrive"
              classNameUploader="uc-light"
              onChange={handleChangeEvent}
              onFileAdded={handleFileAdded}
              onFileRemoved={handleFileRemoved}
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              onModalOpen={handleModalOpen}
              onModalClose={handleModalClose}
            />

            {uploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {!value && !uploading && (
          <p className="text-xs text-muted-foreground text-center">
            Click the area above to upload an image (PNG, JPG, GIF up to{" "}
            {maxSizeMB}MB)
          </p>
        )}
      </div>
    </>
  );
}
