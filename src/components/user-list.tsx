'use client';

import { Trash2, Pencil } from 'lucide-react';
import type { User } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface UserListProps {
  users: User[];
  onDeleteUser: (id: string) => void;
  onUpdateUser: (user: User) => void;
  canDelete?: boolean;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return 'Unlimited';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function UserList({ users, onDeleteUser, onUpdateUser, canDelete = false }: UserListProps) {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showMac, setShowMac] = useState<Record<string, boolean>>({});
  const { authHeader, isAuthenticated } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ username: string; password: string; macAddress: string; uploadLimitBites: number; downloadLimitBites: number }>({ username: '', password: '', macAddress: '', uploadLimitBites: 0, downloadLimitBites: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const togglePassword = (id: string) => setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleMac = (id: string) => setShowMac(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Accounts</CardTitle>
        <CardDescription>A list of all guest accounts on the captive portal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Limits (Up/Down)</TableHead>
                {canDelete && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canDelete ? 5 : 4} className="h-24 text-center">
                    No users found. Add one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <div className="d-flex align-items-center gap-2">
                        <span className="font-mono">
                          {showPassword[user.id] ? user.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          aria-label={showPassword[user.id] ? `Hide password for ${user.username}` : `Show password for ${user.username}`}
                          onClick={() => togglePassword(user.id)}
                        >
                          <i className={`bi ${showPassword[user.id] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.macAddress ? (
                        <div className="d-flex align-items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {showMac[user.id] ? user.macAddress : '••:••:••:••:••:••'}
                          </Badge>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            aria-label={showMac[user.id] ? `Hide MAC for ${user.username}` : `Show MAC for ${user.username}`}
                            onClick={() => toggleMac(user.id)}
                          >
                            <i className={`bi ${showMac[user.id] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      ) : (
                        <Badge variant="outline">Not set</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatBytes(user.uploadLimitBites)} / {formatBytes(user.downloadLimitBites)}
                    </TableCell>
                    {canDelete && (
                    <TableCell className="text-right space-x-1">
                       <Dialog open={editingId === user.id} onOpenChange={(open) => setEditingId(open ? user.id : null)}>
                         <DialogTrigger asChild>
                           <Button
                             variant="ghost"
                             size="icon"
                             aria-label={`Edit user ${user.username}`}
                             onClick={() => {
                               setEditingId(user.id);
                               setForm({
                                 username: user.username,
                                 password: user.password,
                                 macAddress: user.macAddress || '',
                                 uploadLimitBites: user.uploadLimitBites,
                                 downloadLimitBites: user.downloadLimitBites,
                               });
                               setError(null);
                             }}
                           >
                             <Pencil className="h-4 w-4" />
                           </Button>
                         </DialogTrigger>
                         <DialogContent>
                           <DialogHeader>
                             <DialogTitle>Edit Guest Account</DialogTitle>
                             <DialogDescription>Update the fields and save changes.</DialogDescription>
                           </DialogHeader>
                           {error && <div className="text-sm text-destructive">{error}</div>}
                           <div className="space-y-3">
                             <div>
                               <label className="block text-sm font-medium">Username</label>
                               <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                             </div>
                             <div>
                               <label className="block text-sm font-medium">Password</label>
                               <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                             </div>
                             <div>
                               <label className="block text-sm font-medium">MAC Address</label>
                               <Input value={form.macAddress} onChange={(e) => setForm({ ...form, macAddress: e.target.value })} />
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               <div>
                                 <label className="block text-sm font-medium">Upload Limit (bytes)</label>
                                 <Input type="number" value={form.uploadLimitBites} onChange={(e) => setForm({ ...form, uploadLimitBites: Number(e.target.value) })} />
                               </div>
                               <div>
                                 <label className="block text-sm font-medium">Download Limit (bytes)</label>
                                 <Input type="number" value={form.downloadLimitBites} onChange={(e) => setForm({ ...form, downloadLimitBites: Number(e.target.value) })} />
                               </div>
                             </div>
                           </div>
                           <DialogFooter>
                             <Button
                               onClick={async () => {
                                 if (!isAuthenticated) return;
                                 setSaving(true);
                                 setError(null);
                                 const usernameExists = users.some(u => u.id !== (editingId as string) && u.username === form.username);
                                 const mac = form.macAddress?.trim();
                                 const macExists = mac ? users.some(u => u.id !== (editingId as string) && u.macAddress === mac) : false;
                                  if (usernameExists || macExists) {
                                    const msg = usernameExists ? 'Username already exists' : 'MAC address already exists';
                                    setError(msg);
                                    toast({ title: 'Duplicate Found', description: msg, variant: 'destructive' });
                                    setSaving(false);
                                    return;
                                  }
                                 try {
                                   const res = await fetch(`/api/users/${editingId}`, {
                                     method: 'PATCH',
                                     headers: { 'Content-Type': 'application/json', ...authHeader() },
                                     body: JSON.stringify(form),
                                   });
                                   if (!res.ok) {
                                     const msg = await res.json().catch(() => ({ error: 'Failed to update' }));
                                     throw new Error(msg.error || 'Failed to update');
                                   }
                                   const updated: User = await res.json();
                                   onUpdateUser(updated);
                                   setEditingId(null);
                                   toast({
                                     title: 'User Updated',
                                     description: `Changes to "${updated.username}" have been saved.`,
                                   });
                                  } catch (e: any) {
                                  setError(e?.message || 'Failed to update');
                                  toast({
                                    title: 'Failed to Update User',
                                    description: e?.message || 'Something went wrong while saving changes.',
                                    variant: 'destructive',
                                  });
                                  } finally {
                                    setSaving(false);
                                  }
                               }}
                               disabled={saving}
                             >
                               {saving ? 'Saving…' : 'Save changes'}
                             </Button>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" aria-label={`Delete user ${user.username}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account
                              for <span className="font-semibold">{user.username}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
