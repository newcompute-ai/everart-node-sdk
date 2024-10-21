import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';

enum Endpoint {
  FETCH = 'models',
}

type ModelStatus = 'pending' | 'processing' | 'training' | 'ready' | 'failed';

type Model = {
  id: string;
  name: string;
  status: ModelStatus;
};

export type FetchResponse = { models: Model[]; hasMore: boolean };

export type FetchOptions = [
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
export async function fetch(
  this: EverArt,
  ...args: FetchOptions
): Promise<FetchResponse> {
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
    Endpoint.FETCH + (params.length > 0 ? `?${params.join('&')}` : '');

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
      models: response.data.models,
      hasMore: response.data.has_more,
    };
  }

  throw new EverArtError(
    response.status,
    'Failed to get models',
    response.data,
  );
}
