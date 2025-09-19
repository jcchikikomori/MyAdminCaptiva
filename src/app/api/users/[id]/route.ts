import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { requireAuth } from '@/lib/auth/server';
import { addUserFormSchema } from '@/lib/types';

export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return auth.res!;
    const { id } = context.params;
    const storage = getStorage();
    await storage.deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    if (!auth.ok) return auth.res!;
    const { id } = context.params;
    const body = await req.json();
    const parsed = addUserFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const storage = getStorage();
    // Duplicate validation: username and MAC must be unique across other users
    const all = await storage.getUsers();
    const conflict = all.find(
      u => u.id !== id && (u.username === parsed.data.username || (!!parsed.data.macAddress && u.macAddress === parsed.data.macAddress))
    );
    if (conflict) {
      return NextResponse.json({ error: 'Username or MAC already exists' }, { status: 409 });
    }
    const updated = await storage.updateUser(id, parsed.data);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update user' }, { status: 500 });
  }
}
