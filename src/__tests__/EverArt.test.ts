import EverArt from '../index';
import dotenv from 'dotenv';

dotenv.config();

let everart: EverArt | undefined;
const makeEverArt = () => new EverArt(process.env.EVERART_API_KEY || '');

beforeEach(async () => {
  everart = makeEverArt();
});

afterEach(async () => {
  // do nothing yet
});

async function fetchReadyModel() {
  if (!everart) throw new Error('EverArt instance not found');

  const { models } = await everart.v1.models.fetchMany({ limit: 40 });

  const readyModels = models.filter((model) => model.status === 'READY');
  const model = readyModels[0];

  if (!model) throw new Error('No ready models found');

  return model;
}

// // v1/models

test('Fetch many models - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const { models, hasMore } = await everart.v1.models.fetchMany({ limit: 1 });

  console.log('Models:', models);
  console.log('Has More:', hasMore);

  expect(typeof hasMore).toBe('boolean');
  expect(Array.isArray(models)).toBe(true);
});

test('Create style model - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await everart.v1.models.create(
    'api test',
    'STYLE',
    [
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236787949570/out-0.png',
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236783755264/out-0.png',
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236787949568/out-0.png',
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140057613973983233/out-0.png',
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140055275938910211/out-0.png',
    ],
    {
      webhookUrl: 'https://api.everart.ai/webhooks/everart',
    },
  );
  if (!model) throw new Error('Failed to create model.');

  console.log('Model:', model);

  expect(model).toHaveProperty('id');
});

test('Fetch model - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  const model = await everart.v1.models.fetch(models[0].id);

  if (!model) throw new Error('Failed to create model.');

  console.log('Model:', model);

  expect(model).toHaveProperty('id');
});

// v1/models/:id/predictions

test('Create txt2img predictions - (v1/models/:id/predictions)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const predictions = await everart.v1.predictions.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 1,
    },
  );

  console.log('Predictions:', predictions);

  expect(Array.isArray(predictions)).toBe(true);
});

test('Create img2img predictions - (v1/models/:id/predictions)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const predictions = await everart.v1.predictions.create(
    model.id,
    `${model.name} test`,
    'img2img',
    {
      image:
        'https://storage.googleapis.com/storage.catbird.ai/training/model/1000/data/predictions/169147014733500416/v2beta_stable_image_generate_ultra_e660909f-71a0-4bb2-8113-fadb42f3e98f.png',
      imageCount: 1,
    },
  );

  console.log('Predictions:', predictions);

  expect(Array.isArray(predictions)).toBe(true);
});

// v1/predictions/:id

test('Fetch prediction -  (v1/predictions/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const predictions = await everart.v1.predictions.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 1,
    },
  );
  if (!predictions.length) throw new Error('No predictions found');
  const prediction = await everart.v1.predictions.fetch(predictions[0].id);

  console.log('Prediction:', prediction);

  expect(prediction).toHaveProperty('id');
}, 30000);

test('Fetch prediction with polling -  (v1/predictions/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const predictions = await everart.v1.predictions.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 1,
    },
  );
  if (!predictions.length) throw new Error('No predictions found');
  const prediction = await everart.v1.predictions.fetchWithPolling(
    predictions[0].id,
  );

  console.log('Prediction:', prediction);

  expect(prediction).toHaveProperty('id');
  expect(prediction).toHaveProperty('status');
  expect(prediction.status).toBe('SUCCEEDED');
}, 120000);

// v1/models/:id/generations

test('Create txt2img generations - (v1/models/:id/generations)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const generations = await everart.v1.generations.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 3,
      webhookUrl: 'https://api.everart.ai/webhooks/everart',
    },
  );

  console.log('Generations:', generations);

  expect(Array.isArray(generations)).toBe(true);
});

test('Create img2img generations - (v1/models/:id/generations)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const generations = await everart.v1.generations.create(
    model.id,
    `${model.name} test`,
    'img2img',
    {
      image:
        'https://storage.googleapis.com/storage.catbird.ai/training/model/1000/data/predictions/169147014733500416/v2beta_stable_image_generate_ultra_e660909f-71a0-4bb2-8113-fadb42f3e98f.png',
      imageCount: 1,
    },
  );

  console.log('Generations:', generations);

  expect(Array.isArray(generations)).toBe(true);
});

// v1/generations/:id

test('Fetch generation -  (v1/generations/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const generations = await everart.v1.generations.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 1,
    },
  );
  if (!generations.length) throw new Error('No generations found');
  const generation = await everart.v1.generations.fetch(generations[0].id);

  console.log('Generation:', generation);

  expect(generation).toHaveProperty('id');
}, 30000);

test('Fetch generation with polling -  (v1/generations/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await fetchReadyModel();
  const generations = await everart.v1.generations.create(
    model.id,
    `${model.name} test`,
    'txt2img',
    {
      imageCount: 1,
    },
  );
  if (!generations.length) throw new Error('No generations found');
  const generation = await everart.v1.generations.fetchWithPolling(
    generations[0].id,
  );

  console.log('Generation:', generation);

  expect(generation).toHaveProperty('id');
  expect(generation).toHaveProperty('status');
  expect(generation.status).toBe('SUCCEEDED');
}, 120000);
