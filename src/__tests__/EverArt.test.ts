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

// v1/models

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
      'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140055275938910211/out-0.png'
    ]
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

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  if (!models.length) throw new Error('No models found');
  const predictions = await everart.v1.predictions.create(
    models[0].id,
    `${models[0].name} test`,
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

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  if (!models.length) throw new Error('No models found');
  const predictions = await everart.v1.predictions.create(
    models[0].id,
    `${models[0].name} test`,
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

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  if (!models.length) throw new Error('No models found');
  const predictions = await everart.v1.predictions.create(
    models[0].id,
    `${models[0].name} test`,
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

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  if (!models.length) throw new Error('No models found');
  const predictions = await everart.v1.predictions.create(
    models[0].id,
    `${models[0].name} test`,
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

test('Fetch 50 predictions with polling in parallel -  (v1/predictions/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const { models } = await everart.v1.models.fetchMany({ limit: 1 });
  if (!models.length) throw new Error('No models found');

  const createPredictions = async () => {
    const predictions = await everart!.v1.predictions.create(
      models[0].id,
      `${models[0].name} test`,
      'txt2img',
      {
        imageCount: 1,
      },
    );
    if (!predictions.length) throw new Error('No predictions created');
    return predictions[0].id;
  };

  // Create 50 predictions
  const predictionIds = await Promise.all(
    Array(50).fill(null).map(createPredictions),
  );

  // Fetch all predictions with polling in parallel
  const predictions = await Promise.all(
    predictionIds.map((id) => everart!.v1.predictions.fetchWithPolling(id)),
  );

  console.log('Predictions:', predictions);

  predictions.forEach((prediction) => {
    expect(prediction).toHaveProperty('id');
    expect(prediction).toHaveProperty('status');
    expect(prediction.status).toBe('SUCCEEDED');
  });
}, 300000);
