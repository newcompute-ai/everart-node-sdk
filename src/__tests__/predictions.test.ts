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