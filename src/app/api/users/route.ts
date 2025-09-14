import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { addUserFormSchema } from '@/lib/types';

export async function GET() {
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
    const storage = getStorage();
    const body = await req.json();
    const parsed = addUserFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const user = await storage.addUser({ ...parsed.data });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to add user' }, { status: 500 });
  }
}

