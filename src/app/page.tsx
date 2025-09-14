'use client';

import { useEffect, useState } from 'react';
import type { User, AddUserFormValues } from '@/lib/types';
import AddUserForm from '@/components/add-user-form';
import UserList from '@/components/user-list';
import PageHeader from '@/components/page-header';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (e) {
        // ignore; stay with empty list
      }
    };
    load();
  }, []);

  const handleAddUser = (data: AddUserFormValues) => {
    // submit to API; on success, prepend to list
    (async () => {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== id));
        }
      } catch (_) {
        // no-op
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <PageHeader />
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AddUserForm onAddUser={handleAddUser} />
          </div>
          <div className="lg:col-span-3">
            <UserList users={users} onDeleteUser={handleDeleteUser} />
          </div>
        </div>
      </main>
    </div>
  );
}
