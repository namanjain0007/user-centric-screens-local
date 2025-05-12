import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserNotFoundError, IncorrectPasswordError, AuthError } from '@/services/authService';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Type for form values
type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Get the page to redirect to after login (default to dashboard)
  const from = (location.state as any)?.from || '/dashboard';

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Clear any previous errors
      setLoginError(null);
      setIsLoading(true);

      // Call login function from auth context
      await login({
        email: data.email,
        password: data.password,
      });

      // Show success message
      toast.success('Login successful!');

      // Redirect to the intended page after successful login
      navigate(from, { replace: true });
    } catch (error) {
      // Set error message based on error type
      let errorMessage = 'Login failed. Please try again later.';

      // Handle specific error types
      if (error instanceof UserNotFoundError) {
        errorMessage = 'User not found. Please check your email address.';
        toast.error(errorMessage);
      } else if (error instanceof IncorrectPasswordError) {
        errorMessage = 'Incorrect password. Please try again.';
        toast.error(errorMessage);
      } else if (error instanceof AuthError) {
        errorMessage = error.message;
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }

      // Set the error message for display in the form
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">ADMIN LOGIN</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
          {/* Error message display */}
          {loginError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
              <p>{loginError}</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-md">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#9b87f5]" />
                <p className="text-sm text-muted-foreground">Connecting to server...</p>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register('email')}
                className={`pl-10 ${errors.email || (loginError && loginError.includes('email')) || (loginError && loginError.includes('User not found')) ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </button>
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register('password')}
                className={`pl-10 ${errors.password || (loginError && loginError.includes('password')) || (loginError && loginError.includes('Incorrect password')) ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                tabIndex={-1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-[#9b87f5] focus:ring-[#9b87f5]"
                {...register('rememberMe')}
                disabled={isLoading}
              />
              <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                Remember me
              </Label>
            </div>
            <a
              href="#"
              className="text-sm text-[#9b87f5] hover:text-[#8a76e5]"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Password reset functionality is not implemented in this demo');
              }}
            >
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#9b87f5] hover:bg-[#8a76e5] text-white font-medium uppercase h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="animate-pulse">LOGGING IN...</span>
              </>
            ) : (
              'LOG IN'
            )}
          </Button>

          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              type="button"
              className="border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
              onClick={() => toast.info('Google login is not implemented in this demo')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              className="border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
              onClick={() => toast.info('GitHub login is not implemented in this demo')}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
