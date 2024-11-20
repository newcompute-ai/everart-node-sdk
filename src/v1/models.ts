import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';
import { UploadsRequestImage } from './images';
import { v4 as uuidv4 } from 'uuid';

enum Endpoint {
  FETCH = 'models/:id',
  FETCH_MANY = 'models',
  CREATE = 'models',
}

type ModelStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'TRAINING'
  | 'READY'
  | 'FAILED'
  | 'CANCELED';

type ModelSubject = 'OBJECT' | 'STYLE' | 'PERSON';

type Model = {
  id: string;
  name: string;
  status: ModelStatus;
  subject: ModelSubject;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletedAt?: Date;
  thumbnailUrl?: string;
};

function mapModel(model: any) {
  const mapped = {
    ...model,
    createdAt: new Date(model.created_at),
    updatedAt: new Date(model.updated_at),
    estimatedCompletedAt: model.estimated_completed_at
      ? new Date(model.estimated_completed_at)
      : undefined,
    thumbnailUrl: model.thumbnail_url ? model.thumbnail_url : undefined,
  };

  delete mapped.created_at;
  delete mapped.updated_at;
  delete mapped.estimated_completed_at;
  delete mapped.thumbnail_url;

  return mapped;
}

export type FetchManyResponse = { models: Model[]; hasMore: boolean };

export type FetchManyOptions = [
  options?: {
    beforeId?: string;
    limit?: number;
    search?: string;
    status?: ModelStatus;
  },
];

/**
 * EverArt List Models (v1/models)
 */
export async function fetchMany(
  this: EverArt,
  ...args: FetchManyOptions
): Promise<FetchManyResponse> {
  const [options] = args;

  const params: string[] = [];

  if (options) {
    if (options.beforeId) {
      params.push(`before_id=${encodeURIComponent(options.beforeId)}`);
    }
    if (options.limit) {
      params.push(`limit=${options.limit}`);
    }
    if (options.search) {
      params.push(`search=${encodeURIComponent(options.search)}`);
    }
    if (options.status) {
      params.push(`status=${encodeURIComponent(options.status)}`);
    }
  }

  const endpoint =
    Endpoint.FETCH_MANY + (params.length > 0 ? `?${params.join('&')}` : '');

  const response = await axios.get(Util.makeUrl(APIVersion.V1, endpoint), {
    headers: this.defaultHeaders,
    validateStatus: undefined,
  });

  if (
    response.status === 200 &&
    Array.isArray(response.data.models) &&
    typeof response.data.has_more === 'boolean'
  ) {
    return {
      models: response.data.models.map(mapModel),
      hasMore: response.data.has_more,
    };
  }

  throw new EverArtError(
    response.status,
    'Failed to get models',
    response.data,
  );
}

export type FetchResponse = Model;

export type FetchOptions = [id: string];

/**
 * EverArt List Models (v1/models)
 */
export async function fetch(
  this: EverArt,
  ...args: FetchOptions
): Promise<FetchResponse> {
  const [id] = args;

  const endpoint = Endpoint.FETCH.replace(':id', id);

  const response = await axios.get(Util.makeUrl(APIVersion.V1, endpoint), {
    headers: this.defaultHeaders,
    validateStatus: undefined,
  });

  if (response.status === 200 && response.data.model) {
    return mapModel(response.data.model);
  }

  throw new EverArtError(
    response.status,
    'Failed to fetch model',
    response.data,
  );
}

export type URLImageInput = { type: 'url'; value: string };
export type FileImageInput = { type: 'file'; path: string };

export type ImageInput = URLImageInput | FileImageInput;

export type CreateResponse = Model;

export type V1CreateRequiredParams = [
  name: string,
  subject: ModelSubject,
  images: ImageInput[],
];

export type V1CreateOptionalParams = {
  webhookUrl?: string;
};

export type CreateOptions = [
  ...V1CreateRequiredParams,
  options?: V1CreateOptionalParams,
];

/**
 * EverArt List Models (v1/models)
 */
export async function create(
  this: EverArt,
  ...args: CreateOptions
): Promise<CreateResponse> {
  const [name, subject, images, options] = args;

  // Add input validation
  if (!name || typeof name !== 'string') {
    throw new EverArtError(400, 'Name is required and must be a string');
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    throw new EverArtError(400, 'At least one image is required');
  }

  const imageUrls: string[] = (images.filter(i => i.type === 'url') as URLImageInput[]).map(i => i.value);
  const imageUploadTokens: string[] = [];

  const files: {
    name: string,
    path: string,
    contentType: UploadsRequestImage['content_type'],
    id: string
  }[] = (images
    .filter(i => i.type === 'file') as FileImageInput[])
    .map(i => {
      const name = i.path.split('/').pop() || 'image';
      let contentType: UploadsRequestImage['content_type'] = Util.getContentType(name);

      return {
        path: i.path,
        name,
        contentType,
        id: uuidv4()
      }
    });

  if (files.length > 0) {
    try {
      const imageUploads = await this.v1.images.uploads(
        files.map(file => ({
          filename: file.name,
          content_type: file.contentType,
          id: file.id
        }))
      );

      await Promise.all(imageUploads.map(async (imageUpload) => {
        const file = files.find(file => file.id === imageUpload.id);
        if (!file) throw new Error('Could not find associated file for upload');
        
        try {
          await Util.uploadFile(file.path, imageUpload.upload_url, file.contentType);
          imageUploadTokens.push(imageUpload.upload_token);
        } catch (error) {
          throw new EverArtError(
            500,
            `Failed to upload file ${file.name}`,
            error
          );
        }
      }));
    } catch (error) {
      throw new EverArtError(
        500,
        'Failed during file upload process',
        error
      );
    }
  }

  const body: any = {
    name,
    subject,
    image_urls: imageUrls,
    image_upload_tokens: imageUploadTokens,
  };

  if (options?.webhookUrl) body.webhook_url = options.webhookUrl;

  const endpoint = Endpoint.CREATE;

  const response = await axios.post(
    Util.makeUrl(APIVersion.V1, endpoint),
    body,
    {
      headers: this.defaultHeaders,
      validateStatus: undefined,
    },
  );

  if (response.status === 200 && response.data.model) {
    return mapModel(response.data.model);
  }

  throw new EverArtError(
    response.status,
    'Failed to create model',
    response.data,
  );
}
