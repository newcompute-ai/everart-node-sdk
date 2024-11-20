import * as fs from 'fs-extra';
import * as path from 'path';
import EverArt from '../index';
import * as Util from '../util';
import { UploadsRequestImage } from '../v1/images';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const everart = new EverArt(process.env.EVERART_API_KEY as string);

describe('Images', () => {
  it('should upload test images', async () => {
    // Read test images from test_data directory
    const testDataDir = path.join(__dirname, '../../test_data');
    const files = await fs.readdir(testDataDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      throw new Error('No test images found in test_data directory');
    }

    const uploadRequests: UploadsRequestImage[] = imageFiles.map(filename => ({
      filename,
      content_type: Util.getContentType(filename)
    }));

    const uploads = await everart.v1.images.uploads(uploadRequests);

    expect(uploads).toHaveLength(imageFiles.length);
    uploads.forEach(upload => {
      expect(upload).toHaveProperty('upload_token');
      expect(upload).toHaveProperty('upload_url');
      expect(upload).toHaveProperty('file_url');
    });
  });

  it('should upload test images to the provided URLs', async () => {
    const testDataDir = path.join(__dirname, '../../test_data');
    const files = await fs.readdir(testDataDir);
    const filenames = files.filter(file => 
      /\.(jpg|jpeg|png|webp|heic|heif)$/i.test(file)
    );

    if (filenames.length === 0) {
      throw new Error('No test images found in test_data directory');
    }

    const imageFiles: {
        name: string,
        path: string,
        id: string,
        contentType: Util.ContentType
    }[] = filenames.map(filename => ({
        path: path.join(testDataDir, filename),
        name: filename,
        id: uuidv4(),
        contentType: Util.getContentType(filename)
    }));

    const imageUploads = await everart.v1.images.uploads(imageFiles.map(imageFile => ({
        filename: imageFile.name,
        content_type: imageFile.contentType,
        id: imageFile.id
    })));

    await Promise.all(imageUploads.map(async (imageUpload) => {
      const imageFile = imageFiles.find(imageFile => imageFile.id === imageUpload.id);
      if (!imageFile) throw new Error('Could not find associated file for upload');
      
      try {
        await Util.uploadFile(imageFile.path, imageUpload.upload_url, imageFile.contentType);
      } catch (error) {
        throw new Error(`Failed to upload file ${imageFile.name}`);
      }
    }));

    // No error means success
    expect(true).toBe(true);
  });
});