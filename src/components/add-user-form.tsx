'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { addUserFormSchema, type AddUserFormValues } from '@/lib/types';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AddUserFormProps {
  onAddUser: (data: AddUserFormValues) => Promise<User>;
  existingUsers: User[];
}

export default function AddUserForm({ onAddUser, existingUsers }: AddUserFormProps) {
  const { toast } = useToast();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      username: '',
      password: '',
      macAddress: '',
      uploadLimitBites: 0,
      downloadLimitBites: 0,
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    const usernameExists = existingUsers.some(u => u.username === values.username);
    const mac = values.macAddress?.trim();
    const macExists = mac ? existingUsers.some(u => u.macAddress === mac) : false;
    if (usernameExists || macExists) {
      toast({
        title: 'Duplicate Found',
        description: usernameExists ? 'Username already exists' : 'MAC address already exists',
        variant: 'destructive',
      });
      return;
    }
    try {
      const created = await onAddUser(values);
      form.reset();
      toast({
        title: 'User Added',
        description: `User "${created.username}" has been successfully created.`,
      });
    } catch (e: any) {
      toast({
        title: 'Failed to Add User',
        description: e?.message || 'Something went wrong while creating the user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Guest Account</CardTitle>
        <CardDescription>
          Fill in the details to add a new user to the portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., guest_user" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="e.g., S3cur3Pa$$"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="uploadLimitBites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>In bytes. 0 for unlimited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="downloadLimitBites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Download Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>In bytes. 0 for unlimited.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
            >
              Add User
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
