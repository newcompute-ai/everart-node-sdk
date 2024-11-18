import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';

enum Endpoint {
  CREATE = 'models/:id/generations',
  FETCH = 'generations/:id',
}

type GenerationStatus =
  | 'STARTING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';
type GenerationType = 'txt2img' | 'img2img';

type Generation = {
  id: string;
  model_id: string;
  status: GenerationStatus;
  image_url: string | null;
  type: GenerationType;
  createdAt: Date;
  updatedAt: Date;
};

function mapGeneration(generation: any) {
  const mapped = {
    ...generation,
    createdAt: new Date(generation.created_at),
    updatedAt: new Date(generation.updated_at),
  };

   delete mapped.created_at;
   delete mapped.updated_at;

  return mapped;
}

export type FetchResponse = Generation;

export type FetchOptions = [id: string];

/**
 * EverArt Fetch Generation (v1/generations/:id)
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

  if (response.status === 200 && response.data.generation) {
    return mapGeneration(response.data.generation);
  }

  throw new EverArtError(
    response.status,
    'Failed to fetch generation',
    response.data,
  );
}

/**
 * EverArt Fetch Generation w/ polling (v1/generations/:id)
 */
export async function fetchWithPolling(
  this: EverArt,
  ...args: FetchOptions
): Promise<FetchResponse> {
  const [id] = args;

  let generation = await this.v1.generations.fetch(id);

  while (
    generation.status === 'STARTING' ||
    generation.status === 'PROCESSING'
  ) {
    await Util.sleep(1000);
    generation = await this.v1.generations.fetch(id);
  }

  return generation;
}

export type V1CreateRequiredParams = [
  modelId: string,
  prompt: string,
  type: GenerationType,
];

export type V1CreateOptionalParams = {
  image?: string;
  imageCount?: number;
  height?: number;
  width?: number;
  webhookUrl?: string;
};

export type CreateOptions = [
  ...V1CreateRequiredParams,
  options?: V1CreateOptionalParams,
];

export type CreateResponse = Generation[];

/**
 * EverArt Create Generations (v1/models/:id/generations)
 *
 * @param modelId - The model ID to use for the generation
 * @param prompt - The prompt to use for the generation
 * @param options - Additional options for the generation
 */
export async function create(
  this: EverArt,
  ...args: CreateOptions
): Promise<CreateResponse> {
  const [modelId, prompt, type, options] = args;

  const body: any = {
    prompt,
    type,
  };

  if (options?.image) body.image = options.image;
  if (options?.height) body.height = options.height;
  if (options?.width) body.width = options.width;
  if (options?.imageCount) body.image_count = options.imageCount;
  if (options?.webhookUrl) body.webhook_url = options.webhookUrl;

  const endpoint = Endpoint.CREATE.replace(':id', modelId);

  const response = await axios.post(
    Util.makeUrl(APIVersion.V1, endpoint),
    body,
    {
      headers: this.defaultHeaders,
      validateStatus: undefined,
    },
  );

  if (response.status === 200 && Array.isArray(response.data.generations)) {
    return response.data.generations.map(mapGeneration);
  }

  throw new EverArtError(
    response.status,
    'Failed to create generations',
    response.data,
  );
}
