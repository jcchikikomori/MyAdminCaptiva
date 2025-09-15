"use client";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

const PageHeader = () => {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.replace('/login');
  };
  return (
    <div className="text-center relative">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-headline">
        MyAdminCaptiva
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
        Easily manage guest accounts for your captive portal.
      </p>
      {isAuthenticated && (
        <div className="absolute right-0 top-0">
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
