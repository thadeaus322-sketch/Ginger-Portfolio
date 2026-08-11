/**
 * Google Drive upload utility using Google Identity Services (GIS)
 * and the Drive REST API (v3).
 *
 * Requires VITE_GOOGLE_CLIENT_ID to be set.
 */

declare global {
  interface Window {
    GINGER_CONFIG?: {
      googleClientId?: string;
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken(): void };
        };
      };
    };
  }
}

export const GOOGLE_CLIENT_ID =
  window.GINGER_CONFIG?.googleClientId?.trim() ||
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined);

/** Lazily load the Google Identity Services script */
function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/** Obtain a short-lived Drive access token via OAuth popup */
function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else if (resp.access_token) resolve(resp.access_token);
        else reject(new Error("No access token returned"));
      },
    });
    client.requestAccessToken();
  });
}

/** Create a Drive folder and return its ID */
async function createDriveFolder(token: string, name: string): Promise<string> {
  const resp = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  if (!resp.ok) throw new Error(`Failed to create Drive folder: ${resp.statusText}`);
  const data = await resp.json() as { id: string };
  return data.id;
}

/** Fetch an image URL as a Blob */
async function fetchBlob(url: string): Promise<Blob> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Could not fetch image: ${url}`);
  return resp.blob();
}

/** Upload a single Blob to Drive inside a given folder */
async function uploadFileToDrive(
  token: string,
  folderId: string,
  fileName: string,
  blob: Blob,
): Promise<void> {
  const metadata = { name: fileName, parents: [folderId] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);

  const resp = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    },
  );
  if (!resp.ok) throw new Error(`Upload failed: ${resp.statusText}`);
}

export interface UploadProgress {
  uploaded: number;
  total: number;
}

/**
 * Main entry point: authenticate the user and upload all images to a new
 * Drive folder named after the shoot.
 */
export async function saveImagesToDrive(
  imageUrls: string[],
  shootTitle: string,
  onProgress: (p: UploadProgress) => void,
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Drive is not configured yet. Ask your studio to set up the Google Client ID.");
  }

  await loadGIS();
  const token = await getAccessToken(GOOGLE_CLIENT_ID);

  const folderName = `${shootTitle} — Ginger Studios`;
  const folderId = await createDriveFolder(token, folderName);

  const slug = shootTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  for (let i = 0; i < imageUrls.length; i++) {
    const blob = await fetchBlob(imageUrls[i]);
    const ext = blob.type.includes("png") ? "png" : "jpg";
    await uploadFileToDrive(token, folderId, `${slug}-photo-${i + 1}.${ext}`, blob);
    onProgress({ uploaded: i + 1, total: imageUrls.length });
  }
}
