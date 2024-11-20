import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';

enum Endpoint {
  UPLOADS = 'images/uploads'
}

export type ImageUpload = {
  upload_token: string;
  upload_url: string;
  file_url: string;
  id: string;
};

export type UploadsRequestImage = {
  filename: string;
  content_type: Util.ContentType;
  id?: string;
};

export type UploadsOptions = [images: UploadsRequestImage[]];

export type UploadsResponse = ImageUpload[];

/**
 * EverArt Get Image Upload URLs (v1/images/uploads)
 */
export async function uploads(
  this: EverArt,
  ...args: UploadsOptions
): Promise<UploadsResponse> {
  const [images] = args;

  const response = await axios.post(
    Util.makeUrl(APIVersion.V1, Endpoint.UPLOADS),
    { images },
    {
      headers: this.defaultHeaders,
      validateStatus: undefined,
    }
  );

  if (response.status === 200 && Array.isArray(response.data.image_uploads)) {
    return response.data.image_uploads;
  }

  throw new EverArtError(
    response.status,
    'Failed to get upload URLs',
    response.data
  );
}