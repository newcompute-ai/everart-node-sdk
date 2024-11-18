import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';

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

export type CreateResponse = Model;

export type V1CreateRequiredParams = [
  name: string,
  subject: ModelSubject,
  imageUrls: string[],
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
  const [name, subject, imageUrls, options] = args;

  const body: any = {
    name,
    subject,
    image_urls: imageUrls,
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
