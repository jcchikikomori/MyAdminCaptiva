import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { requireAuth } from '@/lib/auth/server';

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
