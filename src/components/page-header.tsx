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
    <div className="relative text-center flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-headline">
        MyAdminCaptiva
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
        Easily manage guest accounts for your captive portal.
      </p>
      {isAuthenticated && (
        <div className="mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-0">
          <Button variant="outline" size="sm" onClick={handleLogout}>Log out</Button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
