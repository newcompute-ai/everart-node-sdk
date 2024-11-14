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

## Table of Contents

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

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const generations = await everart.v1.generations.create(
  models[0].id, 
  `${models[0].name} test`, 
  'txt2img',
  { 
    imageCount: 1 
  }
);

console.log('generations:', generations);
```

### Fetch

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const generations = await everart.v1.generations.create(
  models[0].id, 
  `${models[0].name} test`,
  'txt2img',
  { 
    imageCount: 1 
  }
);
if (!generations.length) throw new Error('No generations found');
const generation = await everart.v1.generations.fetch(generations[0].id);

console.log('generation:', generation);
```

### Fetch With Polling

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const generations = await everart.v1.generations.create(
  models[0].id, 
  `${models[0].name} test`,
  'txt2img',
  { 
    imageCount: 1 
  }
);
if (!generations.length) throw new Error('No generations found');
const generation = await everart.v1.generations.fetchWithPolling(generations[0].id);

console.log('generation:', generation);

```

## Public Models

EverArt provides access to several public models that you can use for generation. Here's a list of available public models:

| Model ID | Name |
|----------|------|
| 5000 | FLUX1.1 [pro] |
| 9000 | FLUX1.1 [pro] (ultra) |
| 6000 | SD 3.5 Large |
| 7000 | Recraft V3 - Realistic |
| 8000 | Recraft V3 - Vector |

To use a public model, you can specify its ID when creating a generation:

```typescript
const generation = await everart.v1.generations.create(
  '5000',  // FLUX1.1 [pro] model ID
  'A beautiful landscape',
  'txt2img',
  { 
    imageCount: 1 
  }
);

console.log('generation:', generation);
```

## Models (v1)

### Fetch
```typescript
const model = await everart.v1.models.fetch('1234567890');

console.log('Model:', model);
```

### Fetch Many
```typescript
const { models, hasMore } = await everart.v1.models.fetchMany();

console.log('Models:', models);
console.log('Has More:', hasMore);
```

### Create
```typescript
const model = await everart.v1.models.create(
  'My Model',
  'OBJECT',
  [
    'https://image.com/1.jpeg',
    'https://image.com/2.jpeg',
    'https://image.com/3.jpeg',
    'https://image.com/4.jpeg',
    'https://image.com/5.jpeg'
  ]
);

console.log('Model:', model);
```

## Deprecation Notice

The `predictions` API is deprecated and will be removed in a future version. Please use the `generations` API instead.

## Development and testing

Built in TypeScript, tested with Jest.

```bash
$ yarn install
$ yarn test
```

Road Map

```
- Support local files
- Support output to S3/GCS bucket
```