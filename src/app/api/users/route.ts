import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { addUserFormSchema } from '@/lib/types';
import { requireAuth } from '@/lib/auth/server';

export async function GET(_req: Request) {
  try {
    const storage = getStorage();
    const users = await storage.getUsers();
    return NextResponse.json(users);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return auth.res!;
    const storage = getStorage();
    const body = await req.json();
    const parsed = addUserFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    // Duplicate validation: username or MAC must be unique
    const all = await storage.getUsers();
    const conflict = all.find(
      u => u.username === parsed.data.username || (!!parsed.data.macAddress && u.macAddress === parsed.data.macAddress)
    );
    if (conflict) {
      return NextResponse.json({ error: 'Username or MAC already exists' }, { status: 409 });
    }
    const user = await storage.addUser({ ...parsed.data });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to add user' }, { status: 500 });
  }
}
