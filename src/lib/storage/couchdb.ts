import { StorageProvider, User, AddUserInput } from './types';

// Minimal CouchDB client via fetch with basic auth in URL
export class CouchDbStorageProvider implements StorageProvider {
  private baseUrl: string;
  private dbName: string;

  constructor(opts?: { baseUrl?: string; dbName?: string }) {
    this.baseUrl = (opts?.baseUrl || process.env.COUCHDB_URL || '').replace(/\/$/, '');
    this.dbName = opts?.dbName || process.env.COUCHDB_DB || 'users';
  }

  private get dbUrl() {
    return `${this.baseUrl}/${this.dbName}`;
  }

  private async ensureDb() {
    const res = await fetch(this.dbUrl, { method: 'GET' });
    if (res.status === 404) {
      const created = await fetch(this.dbUrl, { method: 'PUT' });
      if (!created.ok) throw new Error('Failed to create CouchDB database');
    } else if (!res.ok && res.status !== 200) {
      throw new Error(`CouchDB not reachable: ${res.status}`);
    }
  }

  async getUsers(): Promise<User[]> {
    await this.ensureDb();
    const res = await fetch(`${this.dbUrl}/_all_docs?include_docs=true`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch users from CouchDB');
    const data = await res.json();
    const users: User[] = (data.rows || [])
      .filter((row: any) => row.doc && !row.id?.startsWith('_design/'))
      .map((row: any) => {
        const { _id, _rev, ...doc } = row.doc;
        return { id: _id, ...doc } as User;
      });
    return users;
  }

  async addUser(input: AddUserInput): Promise<User> {
    await this.ensureDb();
    const user: User = {
      id: crypto.randomUUID(),
      timeout: input.timeout ?? 1200,
      ...input,
      macAddress: input.macAddress || null,
    };

    const res = await fetch(`${this.dbUrl}/${encodeURIComponent(user.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Failed to add user to CouchDB: ${msg}`);
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.ensureDb();
    const docRes = await fetch(`${this.dbUrl}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (docRes.status === 404) return; // already gone
    if (!docRes.ok) throw new Error('Failed to fetch user rev from CouchDB');
    const doc = await docRes.json();
    const rev = doc._rev;
    if (!rev) return;
    const delRes = await fetch(
      `${this.dbUrl}/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`,
      { method: 'DELETE' },
    );
    if (!delRes.ok) {
      const msg = await delRes.text();
      throw new Error(`Failed to delete user from CouchDB: ${msg}`);
    }
  }
}

