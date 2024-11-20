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
