# EverArt Node SDK

A TypeScript library to easily access the EverArt REST API.

## Installation

### Yarn
```bash
yarn add everart
```
### NPM
```bash
npm i everart
```

## General Usage

```typescript
import EverArt from 'everart';

const everart = new EverArt(process.env.EVERART_API_KEY);
```

## How to get a key
Log in or sign up at [https://www.everart.ai/](https://www.everart.ai/), then navigate to the API section in the sidebar.

## Types

### Model

```typescript
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

type ModelStatus = 'PENDING' | 'PROCESSING' | 'TRAINING' | 'READY' | 'FAILED' | 'CANCELED';
type ModelSubject = 'OBJECT' | 'STYLE' | 'PERSON';
```

### Generation

```typescript
type Generation = {
  id: string;
  model_id: string;
  status: GenerationStatus;
  image_url: string | null;
  type: GenerationType;
  createdAt: Date;
  updatedAt: Date;
};

type GenerationStatus = 'STARTING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
type GenerationType = 'txt2img' | 'img2img';
```

## API Reference

### Generations (v1)
- [Create](#create)
- [Fetch](#fetch)
- [Fetch w/ Polling](#fetch-with-polling)

### Models (v1)
- [Fetch](#fetch)
- [Fetch Many](#fetch-many)
- [Create](#create)

## Generations (v1)

### Create

Create a new image generation using a model.

```typescript
const generation = await everart.v1.generations.create(
  '5000',  // Model ID
  'A beautiful landscape',  // Prompt
  'txt2img',  // Generation type
  { 
    imageCount: 1,  // Number of images to generate
    height: 512,    // Optional: Image height
    width: 512,     // Optional: Image width
    webhookUrl: 'https://your-webhook.com'  // Optional: Webhook URL for status updates
  }
);
```

### Fetch

Fetch a specific generation by ID.

```typescript
const generation = await everart.v1.generations.fetch('generation_id');
```

### Fetch With Polling

Fetch a generation and wait until it's complete.

```typescript
const generation = await everart.v1.generations.fetchWithPolling('generation_id');
```

## Models (v1)

### Create

Create a new fine-tuned model.

```typescript
const model = await everart.v1.models.create(
  'My Custom Model',  // Model name
  'OBJECT',          // Model subject type
  [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    // ... more training images (minimum 5)
  ],
  {
    webhookUrl: 'https://your-webhook.com'  // Optional: Webhook URL for training updates
  }
);
```

### Fetch

Fetch a specific model by ID.

```typescript
const model = await everart.v1.models.fetch('model_id');
```

### Fetch Many

Fetch multiple models with optional filtering.

```typescript
const { models, hasMore } = await everart.v1.models.fetchMany({
  limit: 10,           // Optional: Number of models to fetch
  beforeId: 'id',      // Optional: Fetch models before this ID
  search: 'keyword',   // Optional: Search models by name
  status: 'READY'      // Optional: Filter by status
});
```

## Public Models

EverArt provides access to several public models that you can use for generation:

| Model ID | Name |
|----------|------|
| 5000 | FLUX1.1 [pro] |
| 9000 | FLUX1.1 [pro] (ultra) |
| 6000 | SD 3.5 Large |
| 7000 | Recraft V3 - Realistic |
| 8000 | Recraft V3 - Vector |

## Error Handling

The SDK throws typed errors for different scenarios:

```typescript
type EverArtErrorName =
  | 'EverArtInvalidRequestError'    // 400: Invalid request parameters
  | 'EverArtUnauthorizedError'      // 401: Invalid API key
  | 'EverArtContentModerationError' // 403: Content violates policies
  | 'EverArtRecordNotFoundError'    // 404: Resource not found
  | 'EverArtUnknownError';          // Other errors
```

## Development and testing

Built in TypeScript, tested with Jest.

```bash
$ yarn install
$ yarn test
```

## Road Map

- Support local files
- Support output to S3/GCS bucket

## License

MIT