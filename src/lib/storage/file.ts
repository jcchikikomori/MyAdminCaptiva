import { promises as fs } from 'fs';
import { dirname } from 'path';
import { StorageProvider, User, AddUserInput } from './types';

const DEFAULT_PATH = '/data/users.json';

async function ensureFile(path: string) {
  try {
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.access(path);
  } catch {
    await fs.writeFile(path, '[]', 'utf-8');
  }
}

export class FileStorageProvider implements StorageProvider {
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || process.env.USERS_FILE_PATH || DEFAULT_PATH;
  }

  private async read(): Promise<User[]> {
    await ensureFile(this.filePath);
    const raw = await fs.readFile(this.filePath, 'utf-8');
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as User[]) : [];
    } catch {
      return [];
    }
  }

  private async write(users: User[]) {
    await ensureFile(this.filePath);
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2), 'utf-8');
  }

  async getUsers(): Promise<User[]> {
    return this.read();
  }

  async addUser(input: AddUserInput): Promise<User> {
    const users = await this.read();
    const user: User = {
      id: crypto.randomUUID(),
      timeout: input.timeout ?? 1200,
      ...input,
      macAddress: input.macAddress || null,
    };
    users.unshift(user);
    await this.write(users);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const users = await this.read();
    const next = users.filter(u => u.id !== id);
    await this.write(next);
  }
}

