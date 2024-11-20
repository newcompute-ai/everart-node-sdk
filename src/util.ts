import axios, { AxiosError } from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const EVERART_BASE_URL = 'https://api.ngrok.everart.ai';

export enum APIVersion {
  V1 = 'v1',
}

// TYPE DEFINTIONS

export type OutputFormat = 'jpeg' | 'png' | 'webp';
export const DEFAULT_OUTPUT_FORMAT: OutputFormat = 'png';

export type EverArtContentResponse = {
  filepath: string;
  filename: string;
  contentType: 'image' | 'video';
  outputFormat: OutputFormat | 'mp4';
  contentFiltered: boolean;
  errored: boolean;
  seed: number;
};

export type EverArtStatusResult = {
  id: string;
  status: 'in-progress';
};

// HELPER FUNCTIONS

export function makeUrl(verison: APIVersion, endpoint: string) {
  return `${EVERART_BASE_URL}/${verison}/${endpoint}`;
}

/**
 * Download an image from a URL and return the local file path
 *
 * @param url
 * @returns filepath string
 */
export async function downloadImage(url: string) {
  let ext = url.split('.').pop() || 'png';
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    ext = 'png';
  }
  const filename = `image-${uuidv4()}.${ext}`;
  const filepath = path.join(os.tmpdir(), filename);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  await fs.ensureDir(path.dirname(filepath));
  await new Promise(async (resolve, reject) => {
    try {
      response.data
        .pipe(fs.createWriteStream(filepath))
        .on('error', reject)
        .once('close', () => resolve(filepath));
    } catch (err) {
      reject(err);
    }
  });
  return filepath;
}

// ERROR HANDLING

export type EverArtErrorName =
  | 'EverArtInvalidRequestError'
  | 'EverArtUnauthorizedError'
  | 'EverArtForbiddenError'
  | 'EverArtContentModerationError'
  | 'EverArtRecordNotFoundError'
  | 'EverArtUnknownError';

export class EverArtError extends Error {
  constructor(status: number, message: string, data?: any) {
    let dataMessage: string;

    try {
      dataMessage = JSON.stringify(data);
    } catch {
      dataMessage = '';
    }

    const fullMessage = `${message}: ${dataMessage}`;

    super(fullMessage);

    let name: EverArtErrorName = 'EverArtUnknownError';

    switch (status) {
      case 400:
        name = 'EverArtInvalidRequestError';
        break;
      case 401:
        name = 'EverArtUnauthorizedError';
        break;
      case 403:
        name = 'EverArtForbiddenError';
        break;
      case 451:  // Using 451 for content moderation (Legal reasons to block content)
        name = 'EverArtContentModerationError';
        break;
      case 404:
        name = 'EverArtRecordNotFoundError';
        break;
    }

    this.name = name;
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uploads a file to a pre-signed URL obtained from the images.uploads endpoint
 * @param filePath Local path to the file to upload
 * @param uploadUrl Pre-signed URL to upload to
 * @param contentType MIME type of the file
 */
export async function uploadFile(filePath: string, uploadUrl: string, contentType: ContentType): Promise<void> {
  const fileStream = fs.createReadStream(filePath);
  
  try {
    await axios.put(uploadUrl, fileStream, {
      headers: {
        'Content-Type': contentType,
      },
      maxBodyLength: Infinity,
    });
  } catch (err) {
    let status = 500;
    let data = undefined;
    
    if (err instanceof AxiosError) {
      status = err.response?.status || 500;
      data = err.response?.data;
    }
    throw new EverArtError(
      status,
      'Failed to upload file',
      data
    );
  } finally {
    fileStream.destroy();
  }
}

export type ContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';

export function getContentType(filename: string): ContentType {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.heic':
      return 'image/heic';
    case '.heif':
      return 'image/heif';
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
}