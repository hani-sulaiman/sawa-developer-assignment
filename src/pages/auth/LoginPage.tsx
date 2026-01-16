import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, PasswordInput } from '@mantine/core';
import { IconMail, IconLock, IconStethoscope } from '@tabler/icons-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { loginSchema } from '@shared/schemas';
import { notifyError, notifySuccess } from '@/services/notify';

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      notifySuccess('Welcome back to MedBook.', 'Signed in');
      if (result.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/doctors');
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      notifyError(message, 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <IconStethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">MedBook</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TextInput
              label="Email"
              placeholder="Enter your email"
              size="lg"
              leftSection={<IconMail size={18} className="text-gray-400" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              size="lg"
              leftSection={<IconLock size={18} className="text-gray-400" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
              Sign up
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Demo Credentials</p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="text-gray-500 dark:text-gray-500">Patient:</span> john@example.com / password123</p>
              <p><span className="text-gray-500 dark:text-gray-500">Doctor:</span> dr.ahmed@medbook.com / doctor123</p>
              <p className="text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
                Also available: patient@test.com / Test1234, doctor@test.com / Test1234
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
            <IconStethoscope className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Healthcare Made Simple</h2>
          <p className="text-blue-100 max-w-md text-lg leading-relaxed">
            Book appointments with top doctors, manage your health records, and take control of your wellness journey.
          </p>
        </div>
      </div>
    </div>
  );
}
