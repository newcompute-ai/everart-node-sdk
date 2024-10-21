import axios from 'axios';
import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const EVERART_BASE_URL = 'https://api.everart.ai';

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
