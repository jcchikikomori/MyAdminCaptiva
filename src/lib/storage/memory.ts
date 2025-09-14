import { StorageProvider, User, AddUserInput } from './types';

export class MemoryStorageProvider implements StorageProvider {
  private users: User[] = [];

  constructor(seed?: User[]) {
    if (seed && Array.isArray(seed)) this.users = [...seed];
  }

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async addUser(input: AddUserInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      timeout: input.timeout ?? 1200,
      ...input,
      macAddress: input.macAddress || null,
    };
    this.users.unshift(user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== id);
  }
}

