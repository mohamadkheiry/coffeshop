import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const root = path.resolve(process.cwd(), 'server');
export const dataDir = path.join(root, 'data');
export const uploadsDir = path.join(root, 'uploads');
const contentPath = path.join(dataDir, 'content.json');
const usersPath = path.join(dataDir, 'users.json');
const seedPath = path.join(dataDir, 'seed.json');

let writeQueue = Promise.resolve();

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function atomicWrite(file, value) {
  const temporaryFile = `${file}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, file);
}

export async function initializeStore() {
  await Promise.all([
    mkdir(dataDir, { recursive: true }),
    mkdir(uploadsDir, { recursive: true }),
  ]);

  try {
    await readFile(contentPath);
  } catch {
    await atomicWrite(contentPath, await readJson(seedPath));
  }

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const users = {
    users: [{
      id: 'primary-admin',
      username,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'admin',
      updatedAt: new Date().toISOString(),
    }],
  };
  await atomicWrite(usersPath, users);
}

export function getContent() {
  return readJson(contentPath);
}

export function getUsers() {
  return readJson(usersPath);
}

export function updateContent(mutator) {
  writeQueue = writeQueue.then(async () => {
    const content = await getContent();
    const updated = await mutator(structuredClone(content));
    updated.updatedAt = new Date().toISOString();
    await atomicWrite(contentPath, updated);
    return updated;
  });
  return writeQueue;
}

