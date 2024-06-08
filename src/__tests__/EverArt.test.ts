import EverArt from '../index';
import dotenv from 'dotenv';

dotenv.config();

let everart: EverArt | undefined;
const makeEverArt = () =>
  new EverArt(process.env.EVERART_API_KEY || '');

beforeEach(async () => {
  everart = makeEverArt();
});

afterEach(async () => {
  // do nothing yet
});

// v1/models

test('Fetch models - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const { models, hasMore } =
    await everart.v1.models.fetch({ limit: 1 });

  console.log('Models:', models);
  console.log('Has More:', hasMore);

  expect(typeof hasMore).toBe('boolean');
  expect(Array.isArray(models)).toBe(true);
});

// v1/models/:id/predictions

test('Create predictions - (v1/models/:id/predictions)', async () => {
  if (!everart) throw new Error('EverArt instance not found');
  
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

  expect(Array.isArray(predictions)).toBe(true);
});

// v1/predictions/:id

test('Fetch prediction -  (v1/predictions/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');
  
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

  expect(prediction).toHaveProperty('id');
}, 30000);

test('Fetch prediction with polling -  (v1/predictions/:id)', async () => {
  if (!everart) throw new Error('EverArt instance not found');
  
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

  expect(prediction).toHaveProperty('id');
  expect(prediction).toHaveProperty('status');
  expect(prediction.status).toBe('succeeded');
}, 120000);