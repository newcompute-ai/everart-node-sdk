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

### Models (v1)
- [Fetch](#fetch)
- [Fetch Many](#fetch-many)
- [Create](#create)

### Predictions (v1)
- [Create](#create)
- [Fetch](#fetch)
- [Fetch w/ Polling](#fetch-with-polling)

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

## Predictions (v1)

### Create

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const predictions = await everart.v1.predictions.create(
  models[0].id, 
  `${models[0].name} test`, 
  'txt2img',
  { 
    imageCount: 1 
  }
);

console.log('Predictions:', predictions);
```

### Fetch

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const predictions = await everart.v1.predictions.create(
  models[0].id, 
  `${models[0].name} test`,
  'txt2img',
  { 
    imageCount: 1 
  }
);
if (!predictions.length) throw new Error('No predictions found');
const prediction = await everart.v1.predictions.fetch(predictions[0].id);

console.log('Prediction:', prediction);
```

### Fetch With Polling

```typescript
const { models } = await everart.v1.models.fetch({ limit: 1 }); 
if (!models.length) throw new Error('No models found');
const predictions = await everart.v1.predictions.create(
  models[0].id, 
  `${models[0].name} test`,
  'txt2img',
  { 
    imageCount: 1 
  }
);
if (!predictions.length) throw new Error('No predictions found');
const prediction = await everart.v1.predictions.fetchWithPolling(predictions[0].id);

console.log('Prediction:', prediction);
```

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