import axios from 'axios';
import { APIVersion, EverArtError } from '../util';
import * as Util from '../util';
import EverArt from '..';

enum Endpoint {
  CREATE = 'models/:id/predictions',
  FETCH = 'predictions/:id',
}

type PredictionStatus =
  | 'STARTING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';
type PredictionType = 'txt2img' | 'img2img';

type Prediction = {
  id: string;
  model_id: string;
  status: PredictionStatus;
  image_url: string | null;
  type: PredictionType;
};

export type FetchResponse = Prediction;

export type FetchOptions = [id: string];

/**
 * EverArt Fetch Prediction (v1/predictions/:id)
 *
 * @deprecated Use generations instead. This will be removed in a future version.
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

  if (response.status === 200 && response.data.prediction) {
    return response.data.prediction;
  }

  throw new EverArtError(
    response.status,
    'Failed to fetch prediction',
    response.data,
  );
}

/**
 * EverArt Fetch Prediction w/ polling (v1/predictions/:id)
 *
 * @deprecated Use generations instead. This will be removed in a future version.
 */
export async function fetchWithPolling(
  this: EverArt,
  ...args: FetchOptions
): Promise<FetchResponse> {
  const [id] = args;

  let prediction = await this.v1.predictions.fetch(id);

  while (
    prediction.status === 'STARTING' ||
    prediction.status === 'PROCESSING'
  ) {
    await Util.sleep(1000);
    prediction = await this.v1.predictions.fetch(id);
  }

  return prediction;
}

export type V1CreateRequiredParams = [
  modelId: string,
  prompt: string,
  type: PredictionType,
];

export type V1CreateOptionalParams = {
  image?: string;
  imageCount?: number;
  height?: number;
  width?: number;
};

export type CreateOptions = [
  ...V1CreateRequiredParams,
  options?: V1CreateOptionalParams,
];

export type CreateResponse = Prediction[];

/**
 * EverArt Create Predictions (v1/models/:id/predictions)
 *
 * @deprecated Use generations instead. This will be removed in a future version.
 *
 * @param modelId - The model ID to use for the prediction
 * @param prompt - The prompt to use for the prediction
 * @param options - Additional options for the predictions
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

  const endpoint = Endpoint.CREATE.replace(':id', modelId);

  const response = await axios.post(
    Util.makeUrl(APIVersion.V1, endpoint),
    body,
    {
      headers: this.defaultHeaders,
      validateStatus: undefined,
    },
  );

  if (response.status === 200 && Array.isArray(response.data.predictions)) {
    return response.data.predictions;
  }

  throw new EverArtError(
    response.status,
    'Failed to create predictions',
    response.data,
  );
}
