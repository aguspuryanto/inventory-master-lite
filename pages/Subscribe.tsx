import React, { useState } from 'react';
import { Crown, Check, ArrowLeft, Mail, User, Building, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Subscribe: React.FC = () => {
  const { user, currentStore } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: currentStore?.name || '',
    package: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    {
      name: 'Starter',
      description: 'Untuk bisnis yang baru memulai',
      price: 'Rp 1.2JT',
      period: '/tahun',
      discount: 'HEMAT 20%',
      features: [
        '1 Kasir',
        '100 Produk',
        'Transaksi dasar',
        'Laporan sederhana',
        'Support email'
      ],
      popular: false
    },
    {
      name: 'Bisnis',
      description: 'Untuk bisnis yang sedang berkembang',
      price: 'Rp 1.8JT',
      period: '/tahun',
      discount: 'HEMAT 20%',
      features: [
        'Unlimited Kasir',
        'Unlimited Produk',
        'QRIS & E-Wallet',
        'Manajemen Stok',
        'Laporan lengkap',
        'Backup otomatis',
        'Support priority'
      ],
      popular: true
    },
    {
      name: 'Premium',
      description: 'Untuk bisnis besar dan korporat',
      price: 'Rp 4.2JT',
      period: '/tahun',
      discount: 'HEMAT 20%',
      features: [
        'Semua fitur Bisnis',
        'Multi Cabang (5)',
        'API Access',
        'Custom branding',
        'Dedicated support',
        'Training tim',
        'Integrasi akuntansi'
      ],
      popular: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare email data with user and currentStore information
    const emailData = {
      ...formData,
      userData: user ? {
        email: user.email,
        fullName: user.full_name,
        isOwner: user.is_owner,
        isSubscribe: user.is_subscribe
      } : null,
      storeData: currentStore ? {
        name: currentStore.name,
        id: currentStore.id
      } : null,
      timestamp: new Date().toISOString()
    };

    try {
      // Here you would typically send this data to your backend/email service
      console.log('Email data to send:', emailData);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Terima kasih! Permintaan Anda telah dikirim. Tim kami akan segera menghubungi Anda.');
      setShowEmailForm(false);
      setFormData({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        businessName: currentStore?.name || '',
        package: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/settings"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft size={20} />
            Kembali ke Pengaturan
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4">
              <Crown className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Berlangganan Premium
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Dapatkan akses penuh ke semua fitur DTAKasir
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 ${
                plan.popular
                  ? 'border-purple-500 shadow-lg shadow-purple-200 dark:shadow-purple-900/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    POPULER
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {plan.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>
                {/* <div className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                  {plan.discount}
                </div> */}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="text-green-600 dark:text-green-400" size={12} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  plan.popular
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                }`}
              >
                Mulai Berlangganan
              </button> */}
            </div>
          ))}
        </div>

        {/* Apply Discount */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            Diskon Spesial untuk Pendaftar Baru
          </h2>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Dapatkan 20% Diskon untuk 1 Tahun Pertama!
            </h3>
            <p className="text-purple-100 text-lg mb-6">
              Bergabunglah dengan ribuan pengguna yang sudah memilih EzyKasir untuk mengelola bisnis mereka.
            </p>
            <button 
              onClick={() => setShowEmailForm(true)}
              className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Mulai Sekarang
            </button>
          </div>
        </div>

        {/* Email Form Modal */}
        {showEmailForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Hubungi Kami
                </h3>
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!user?.full_name && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  </div>
                )}

                {!user?.email && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                )}

                {!user?.phone && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                )}

                {!currentStore?.name && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nama Bisnis
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Nama bisnis Anda"
                      />
                    </div>
                  </div>
                )}

                {/* Subscription Package */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Paket Berlangganan
                  </label>
                  <select
                    name="package"
                    value={formData.package}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Pilih paket</option>
                    {plans.map((plan) => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Pesan (Opsional)
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Ceritakan kebutuhan bisnis Anda..."
                  />
                </div>

                {/* User and Store Info Display */}
                {(user || currentStore) && (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Informasi Akun:
                    </p>
                    {user && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p>Email: {user.email}</p>
                        <p>Nama: {user.full_name || 'Tidak tersedia'}</p>
                      </div>
                    )}
                    {currentStore && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        <p>Toko: {currentStore.name}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Apa saja yang saya dapatkan di Premium?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Anda mendapatkan akses penuh ke semua fitur termasuk sinkronisasi real-time, backup otomatis, dan support prioritas.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Bagaimana cara pembayarannya?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Pembayaran dapat dilakukan melalui transfer bank atau e-wallet. Langganan akan diperpanjang otomatis setiap bulan.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Apakah saya bisa berhenti berlangganan?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Ya, Anda dapat berhenti berlangganan kapan saja. Data Anda akan tetap aman dan dapat diunduh.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Apakah ada garansi uang kembali?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Kami memberikan garansi uang kembali 7 hari jika Anda tidak puas dengan layanan kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
