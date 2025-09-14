import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function DELETE(_req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const storage = getStorage();
    await storage.deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete user' }, { status: 500 });
  }
}

