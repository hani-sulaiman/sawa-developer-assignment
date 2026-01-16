import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, PasswordInput } from '@mantine/core';
import { IconMail, IconLock, IconUser, IconStethoscope } from '@tabler/icons-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { registerSchema } from '@shared/schemas';
import { notifyError, notifySuccess } from '@/services/notify';

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'patient',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      notifySuccess('Your account has been created successfully.', 'Welcome to MedBook');
      navigate('/doctors');
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      notifyError(message, 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-950">
      {/* Left Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white text-center">
          <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8">
            <IconStethoscope className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Join MedBook Today</h2>
          <p className="text-blue-100 max-w-md text-lg leading-relaxed">
            Access thousands of healthcare professionals, book appointments instantly, and take the first step towards better health.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold mb-1">500+</p>
              <p className="text-blue-200 text-sm">Verified Doctors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold mb-1">50K+</p>
              <p className="text-blue-200 text-sm">Happy Patients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400">Start your healthcare journey with MedBook</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <TextInput
              label="Full Name"
              placeholder="Enter your full name"
              size="lg"
              leftSection={<IconUser size={18} className="text-gray-400" />}
              error={errors.name?.message}
              {...register('name')}
            />

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
              placeholder="Create a password"
              size="lg"
              leftSection={<IconLock size={18} className="text-gray-400" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              size="lg"
              leftSection={<IconLock size={18} className="text-gray-400" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <input type="hidden" {...register('role')} value="patient" />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms</a> and{' '}
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
