'use client';

import { useEffect, useState } from 'react';
import type { User, AddUserFormValues } from '@/lib/types';
import AddUserForm from '@/components/add-user-form';
import UserList from '@/components/user-list';
import PageHeader from '@/components/page-header';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const { isAuthenticated, authHeader } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
        } else {
          toast({
            title: 'Failed to Load Users',
            description: `Server responded with ${res.status}`,
            variant: 'destructive',
          });
        }
      } catch (e) {
        toast({
          title: 'Failed to Load Users',
          description: 'Network error while fetching users.',
          variant: 'destructive',
        });
      }
    };
    load();
  }, [isAuthenticated]);

  const handleAddUser = async (data: AddUserFormValues): Promise<User> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({ error: `Failed with status ${res.status}` }));
        throw new Error(msg.error || 'Failed to create user');
      }
      const created: User = await res.json();
      setUsers(prev => [created, ...prev]);
      return created;
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = (id: string) => {
    (async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { ...authHeader() } });
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== id));
          toast({
            title: 'User Deleted',
            description: 'The user has been removed successfully.',
          });
        } else {
          const msg = await res.json().catch(() => ({ error: `Failed with status ${res.status}` }));
          toast({
            title: 'Failed to Delete User',
            description: msg.error || 'Server error while deleting user.',
            variant: 'destructive',
          });
        }
      } catch (_) {
        toast({
          title: 'Failed to Delete User',
          description: 'Network error while deleting user.',
          variant: 'destructive',
        });
      }
    })();
  };

  const handleUpdateUser = (updated: User) => {
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container-fluid container-xl mx-auto px-4 py-8 md:py-12">
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
