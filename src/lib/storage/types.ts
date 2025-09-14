export type User = {
  id: string;
  username: string;
  password: string;
  macAddress: string | null;
  uploadLimitBites: number;
  downloadLimitBites: number;
  timeout: number;
};

export type AddUserInput = Omit<User, "id" | "timeout"> & {
  timeout?: number;
};

export interface StorageProvider {
  getUsers(): Promise<User[]>;
  addUser(input: AddUserInput): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

