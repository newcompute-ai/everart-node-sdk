import _ from 'lodash';
import * as V1Generations from './v1/generations';
import * as V1Images from './v1/images';
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
      generations: {
        create: (
          ...args: V1Generations.CreateOptions
        ): Promise<V1Generations.CreateResponse> =>
          V1Generations.create.bind(this)(...args),
        fetch: (
          ...args: V1Generations.FetchOptions
        ): Promise<V1Generations.FetchResponse> =>
          V1Generations.fetch.bind(this)(...args),
        fetchWithPolling: (
          ...args: V1Generations.FetchOptions
        ): Promise<V1Generations.FetchResponse> =>
          V1Generations.fetchWithPolling.bind(this)(...args),
      },
      images: {
        uploads: (
          ...args: V1Images.UploadsOptions
        ): Promise<V1Images.UploadsResponse> =>
          V1Images.uploads.bind(this)(...args),
      },
      models: {
        fetch: (
          ...args: V1Models.FetchOptions
        ): Promise<V1Models.FetchResponse> =>
          V1Models.fetch.bind(this)(...args),
        fetchMany: (
          ...args: V1Models.FetchManyOptions
        ): Promise<V1Models.FetchManyResponse> =>
          V1Models.fetchMany.bind(this)(...args),
        create: (
          ...args: V1Models.CreateOptions
        ): Promise<V1Models.CreateResponse> =>
          V1Models.create.bind(this)(...args),
      },
      /**
       * @deprecated Use generations instead. This will be removed in a future version.
       */
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
