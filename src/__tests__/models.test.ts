import EverArt from '../index';
import dotenv from 'dotenv';
import * as fs from 'fs-extra';
import * as path from 'path';

dotenv.config();

let everart: EverArt | undefined;
const makeEverArt = () => new EverArt(process.env.EVERART_API_KEY || '');

beforeEach(async () => {
  everart = makeEverArt();
});

afterEach(async () => {
  // do nothing yet
});

// // v1/models

test('Fetch many models - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const { models, hasMore } = await everart.v1.models.fetchMany({ limit: 1 });

  console.log('Models:', models);
  console.log('Has More:', hasMore);

  expect(typeof hasMore).toBe('boolean');
  expect(Array.isArray(models)).toBe(true);
});

test('Create style model with image urls - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');

  const model = await everart.v1.models.create(
    'api test',
    'STYLE',
    [
      { type: 'url', value: 'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236787949570/out-0.png' },
      { type: 'url', value: 'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236783755264/out-0.png' },
      { type: 'url', value: 'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140059236787949568/out-0.png' },
      { type: 'url', value: 'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140057613973983233/out-0.png' },
      { type: 'url', value: 'https://storage.googleapis.com/storage.catbird.ai/training/model/129541926348263424/data/predictions/140055275938910211/out-0.png' },
    ],
    {
      webhookUrl: 'https://api.everart.ai/webhooks/everart',
    },
  );
  if (!model) throw new Error('Failed to create model.');

  console.log('Model:', model);

  expect(model).toHaveProperty('id');
});

test('Create style model with image files - (v1/models)', async () => {
  if (!everart) throw new Error('EverArt instance not found');
  
  const testDataDir = path.join(__dirname, '../../test_data');
  const files = await fs.readdir(testDataDir);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file)
  );
  console.log(imageFiles);

  const model = await everart.v1.models.create(
    'api test',
    'STYLE',
    imageFiles.map(file => ({ type: 'file', path: path.join(testDataDir, file) })),
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