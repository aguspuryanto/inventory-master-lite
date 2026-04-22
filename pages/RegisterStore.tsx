import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building2, Mail, Phone, MapPin, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod schema for registration form validation
const registrationSchema = z.object({
  storeName: z.string().min(1, 'Nama toko wajib diisi'),
  storeEmail: z.string().email('Email toko tidak valid'),
  storePhone: z.string().min(1, 'Telepon toko wajib diisi'),
  storeAddress: z.string().min(1, 'Alamat toko wajib diisi'),
  storeDescription: z.string().optional(),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  // email: z.string().email('Email tidak valid').optional(),
  // phone: z.string().min(1, 'Telepon wajib diisi').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi password tidak cocok',
  path: ['confirmPassword']
});

const RegisterStore: React.FC = () => {
  const navigate = useNavigate();
  const { registerStore } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit: handleFormSubmit, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      // Store data
      storeName: '',
      storeDescription: '',
      storeAddress: '',
      storePhone: '',
      storeEmail: '',
      
      // User data
      fullName: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: any) => {
    console.log('Form data submitted:', data);
    setError('');
    setIsLoading(true); // Enable loading state
    
    let registrationSuccessful = false;
    
    try {
      // Register store
      console.log('Calling registerStore function...');
      const result = await registerStore(
        {
          name: data.storeName,
          description: data.storeDescription,
          address: data.storeAddress,
          phone: data.storePhone,
          email: data.storeEmail
        },
        {
          email: data.storeEmail,
          full_name: data.fullName,
          phone: data.storePhone
        },
        data.password
      );
      
      console.log('Registration result:', result);
      registrationSuccessful = true;
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Registration failed: ';
      
      if (err.code === '23505' && err.message?.includes('users_email_key')) {
        errorMessage += err.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Terjadi kesalahan saat mendaftar';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false); // Disable loading state
    }

    // Show success message and navigate only if registration was successful
    if (registrationSuccessful) {
      console.log('Registration successful! Setting success message...');
      setSuccess('Toko Anda berhasil didaftarkan! Anda akan dialihkan ke halaman login...');
      
      // Clear error if any
      setError('');
      
      // Navigate to login after 2 seconds
      setTimeout(() => {
        console.log('Navigating to login page...');
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="text-purple-600 dark:text-purple-400" size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
            Daftarkan Toko Anda
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Mulai kelola bisnis UMKM Anda dengan sistem kasir modern
          </p>
        </div>

        {/* {console.log('Rendering - error state:', error)} */}
        {error && error !== '' && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{success}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
          {/* Store Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
              Informasi Toko
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Toko *
              </label>
              <input
                type="text"
                {...register('storeName')}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Toko ABC"
              />
              {errors.storeName && (
                <p className="text-rose-500 text-sm mt-1">{errors.storeName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Deskripsi Toko
              </label>
              <textarea
                {...register('storeDescription')}
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                placeholder="Deskripsi singkat tentang toko Anda"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Alamat Toko
                </label>
                <input
                  type="text"
                  {...register('storeAddress')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Jl. Contoh No. 123"
                />
                {errors.storeAddress && (
                  <p className="text-rose-500 text-sm mt-1">{errors.storeAddress.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Telepon Toko
                </label>
                <input
                  type="tel"
                  {...register('storePhone')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="(021) 12345678"
                />
                {errors.storePhone && (
                  <p className="text-rose-500 text-sm mt-1">{errors.storePhone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Mail size={16} className="inline mr-1" />
                Email Toko
              </label>
              <input
                type="email"
                {...register('storeEmail')}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="toko@example.com"
              />
              {errors.storeEmail && (
                <p className="text-rose-500 text-sm mt-1">{errors.storeEmail.message}</p>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User size={20} className="text-purple-600 dark:text-purple-400" />
              Informasi Pemilik
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-rose-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="+62812345678"
                />
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className="w-full px-4 py-3 pr-12 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                  {errors.password && (
                    <p className="text-rose-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Ulangi password"
                />
                {errors.confirmPassword && (
                  <p className="text-rose-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all shadow-lg shadow-purple-100 dark:shadow-none"
          >
            {isLoading ? 'Mendaftarkan...' : 'Daftarkan Toko'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            Sudah punya akun?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStore;
