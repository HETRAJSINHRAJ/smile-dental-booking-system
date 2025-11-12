/**
 * Upload file to Uploadcare
 * Uses the same logic as service/provider image uploads
 */
export async function uploadToUploadcare(file: File): Promise<string | null> {
  try {
    const UPLOADCARE_PUBLIC_KEY = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    
    if (!UPLOADCARE_PUBLIC_KEY) {
      console.error('Uploadcare public key not configured');
      throw new Error('Uploadcare public key not configured');
    }

    console.log('Uploading file to Uploadcare:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const formData = new FormData();
    formData.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
    formData.append('file', file);
    formData.append('UPLOADCARE_STORE', '1'); // Important: Store the file permanently

    const response = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: formData,
    });

    console.log('Uploadcare response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Uploadcare upload failed:', errorText);
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Uploadcare response:', result);
    
    // Uploadcare returns the file UUID in the 'file' field
    // We need to construct the URL using the custom CNAME domain
    if (result.file) {
      // Use custom CNAME domain from environment variable, or fallback to your domain
      const UPLOADCARE_CDN_BASE = process.env.NEXT_PUBLIC_UPLOADCARE_CDN_BASE || 'https://6259lznt1b.ucarecd.net';
      const cdnUrl = `${UPLOADCARE_CDN_BASE}/${result.file}/`;
      console.log('File uploaded successfully:', cdnUrl);
      return cdnUrl;
    } else {
      console.error('No file ID in Uploadcare response:', result);
      throw new Error('No file ID returned from Uploadcare');
    }
  } catch (error) {
    console.error('Error uploading to Uploadcare:', error);
    return null;
  }
}

/**
 * Delete file from Uploadcare
 */
export async function deleteFromUploadcare(fileId: string): Promise<boolean> {
  try {
    const UPLOADCARE_PUBLIC_KEY = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;
    const UPLOADCARE_SECRET_KEY = process.env.UPLOADCARE_SECRET_KEY;
    
    if (!UPLOADCARE_SECRET_KEY || !UPLOADCARE_PUBLIC_KEY) {
      console.warn('Uploadcare keys not configured, cannot delete files');
      return false;
    }

    const response = await fetch(`https://api.uploadcare.com/files/${fileId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Uploadcare.Simple ${UPLOADCARE_PUBLIC_KEY}:${UPLOADCARE_SECRET_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting from Uploadcare:', error);
    return false;
  }
}

/**
 * Extract file ID from Uploadcare URL
 * Supports both default (ucarecdn.com) and custom CNAME domains
 */
export function extractUploadcareFileId(url: string): string | null {
  // Match UUID pattern in URL (works with any domain)
  const match = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  return match ? match[1] : null;
}
