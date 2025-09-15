'use client';

import { useEffect, useState } from 'react';
import type { User, AddUserFormValues } from '@/lib/types';
import AddUserForm from '@/components/add-user-form';
import UserList from '@/components/user-list';
import PageHeader from '@/components/page-header';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAuthenticated, authHeader } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const load = async () => {
      try {
        // GET is open for read-only; send auth header if present
        const headers = authHeader();
        const res = await fetch('/api/users', { cache: 'no-store', headers: { ...headers } });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        // ignore; stay with empty list
      }
    };
    load();
  }, [isAuthenticated]);

  const handleAddUser = (data: AddUserFormValues) => {
    // submit to API; on success, prepend to list
    (async () => {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader() },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const created: User = await res.json();
          setUsers(prev => [created, ...prev]);
        }
      } catch (_) {
        // no-op
      }
    })();
  };

  const handleDeleteUser = (id: string) => {
    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== id));
        }
      } catch (_) {
        // no-op
      }
    })();
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PageHeader />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {isAuthenticated && (
            <div className="lg:col-span-2">
              <AddUserForm onAddUser={handleAddUser} existingUsers={users} />
            </div>
          )}
          <div className="lg:col-span-3">
            <UserList users={users} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} canDelete={isAuthenticated} />
          </div>
        </div>
      </main>
    </div>
  );
}
