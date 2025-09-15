'use client';

import { Trash2 } from 'lucide-react';
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
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return 'Unlimited';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};


import { useState } from 'react';

export default function UserList({ users, onDeleteUser }: UserListProps) {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showMac, setShowMac] = useState<Record<string, boolean>>({});

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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
                    <TableCell className="text-right">
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
