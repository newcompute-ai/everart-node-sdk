import _ from 'lodash';
import * as V1Models from './v1/models';
import * as V1Predictions from './v1/predictions';

class EverArt {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  protected get defaultHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  public get v1() {
    return {
      models: {
        fetch: (
          ...args: V1Models.FetchOptions
        ): Promise<V1Models.FetchResponse> =>
          V1Models.fetch.bind(this)(...args),
      },
      predictions: {
        create: (
          ...args: V1Predictions.CreateOptions
        ): Promise<V1Predictions.CreateResponse> =>
          V1Predictions.create.bind(this)(...args),
        fetch: (
          ...args: V1Predictions.FetchOptions
        ): Promise<V1Predictions.FetchResponse> =>
          V1Predictions.fetch.bind(this)(...args),
        fetchWithPolling: (
          ...args: V1Predictions.FetchOptions
        ): Promise<V1Predictions.FetchResponse> =>
          V1Predictions.fetchWithPolling.bind(this)(...args),
      },
    };
  }
}

export default EverArt;
