'use client';

import { useState } from 'react';
import { subscriptionApi } from '@/lib/api/subscription';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { QrCode, CreditCard, Smartphone, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: number;
  amount: number;
  onPaymentSuccess?: () => void;
}

type PaymentMethod = 'qris' | 'virtual_account' | 'e_wallet';

const BANK_OPTIONS = [
  { value: 'BCA', label: 'Bank Central Asia (BCA)' },
  { value: 'BNI', label: 'Bank Negara Indonesia (BNI)' },
  { value: 'BRI', label: 'Bank Rakyat Indonesia (BRI)' },
  { value: 'MANDIRI', label: 'Bank Mandiri' },
  { value: 'PERMATA', label: 'Bank Permata' },
];

const E_WALLET_OPTIONS = [
  { value: 'OVO', label: 'OVO' },
  { value: 'DANA', label: 'DANA' },
  { value: 'LINKAJA', label: 'LinkAja' },
  { value: 'SHOPEEPAY', label: 'ShopeePay' },
];

export function PaymentGatewayModal({
  isOpen,
  onClose,
  tenantId,
  amount,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedEWallet, setSelectedEWallet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  const handleCreatePayment = async () => {
    if (!selectedMethod) {
      alert('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (selectedMethod === 'virtual_account' && !selectedBank) {
      alert('Pilih bank terlebih dahulu');
      return;
    }

    if (selectedMethod === 'e_wallet' && !selectedEWallet) {
      alert('Pilih e-wallet terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const response = await subscriptionApi.createPayment(tenantId, {
        paymentMethod: selectedMethod,
        amount,
        bankCode: selectedMethod === 'virtual_account' ? selectedBank : undefined,
        channelCode: selectedMethod === 'e_wallet' ? selectedEWallet : undefined,
      });

      // Handle response - could be response.data or direct response
      const paymentResponse = response.data || response;
      setPaymentData(paymentResponse);
      
      // Start polling for payment status
      if (paymentResponse.id) {
        startPolling(paymentResponse.id);
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      alert(error.response?.data?.message || error.message || 'Gagal membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (transactionId: number) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await subscriptionApi.getPaymentStatus(tenantId, transactionId);
        const paymentStatus = response.data || response;
        const status = paymentStatus.status;

        if (status === 'paid') {
          clearInterval(interval);
          setPolling(false);
          setPaymentData((prev: any) => ({ ...prev, status: 'paid' }));
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
          setTimeout(() => {
            handleClose();
          }, 2000);
        } else if (status === 'expired' || status === 'failed' || status === 'cancelled') {
          clearInterval(interval);
          setPolling(false);
          setPaymentData((prev: any) => ({ ...prev, status }));
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 5 * 60 * 1000);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setSelectedBank('');
    setSelectedEWallet('');
    setPaymentData(null);
    setPolling(false);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pembayaran Subscription">
      <div className="space-y-6">
        {!paymentData ? (
          <>
            <div>
              <p className="text-lg font-semibold mb-2">Total Pembayaran</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(amount)}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Pilih Metode Pembayaran</p>
              <div className="grid grid-cols-1 gap-3">
                {/* QRIS */}
                <button
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedMethod === 'qris'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">QRIS</p>
                      <p className="text-sm text-gray-600">Scan QR Code dengan aplikasi e-wallet atau mobile banking</p>
                    </div>
                  </div>
                </button>

                {/* Virtual Account */}
                <button
                  onClick={() => setSelectedMethod('virtual_account')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedMethod === 'virtual_account'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Virtual Account</p>
                      <p className="text-sm text-gray-600">Transfer ke nomor Virtual Account</p>
                    </div>
                  </div>
                </button>

                {/* E-Wallet */}
                <button
                  onClick={() => setSelectedMethod('e_wallet')}
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    selectedMethod === 'e_wallet'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">E-Wallet</p>
                      <p className="text-sm text-gray-600">Bayar dengan OVO, DANA, LinkAja, atau ShopeePay</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bank Selection for Virtual Account */}
            {selectedMethod === 'virtual_account' && (
              <div>
                <p className="text-sm font-medium mb-2">Pilih Bank</p>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Bank</option>
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* E-Wallet Selection */}
            {selectedMethod === 'e_wallet' && (
              <div>
                <p className="text-sm font-medium mb-2">Pilih E-Wallet</p>
                <select
                  value={selectedEWallet}
                  onChange={(e) => setSelectedEWallet(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih E-Wallet</option>
                  {E_WALLET_OPTIONS.map((wallet) => (
                    <option key={wallet.value} value={wallet.value}>
                      {wallet.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleCreatePayment}
                disabled={loading || !selectedMethod}
                className="flex-1"
              >
                {loading ? <Loading /> : 'Lanjutkan Pembayaran'}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Batal
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {paymentData.status === 'paid' ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-green-600 mb-2">Pembayaran Berhasil!</p>
                <p className="text-gray-600">Subscription Anda telah diaktifkan.</p>
              </div>
            ) : paymentData.status === 'expired' || paymentData.status === 'failed' ? (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-xl font-semibold text-red-600 mb-2">
                  {paymentData.status === 'expired' ? 'Pembayaran Kedaluwarsa' : 'Pembayaran Gagal'}
                </p>
                <p className="text-gray-600">Silakan coba lagi dengan metode pembayaran lain.</p>
              </div>
            ) : (
              <>
                {paymentData.qrCode && (
                  <div className="text-center">
                    <p className="font-semibold mb-2">Scan QR Code untuk membayar</p>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={paymentData.qrCode} alt="QR Code" className="w-64 h-64" />
                    </div>
                  </div>
                )}

                {paymentData.virtualAccountNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Nomor Virtual Account</p>
                    <p className="text-2xl font-mono font-bold">{paymentData.virtualAccountNumber}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Transfer sesuai nominal ke nomor VA di atas. Pembayaran akan otomatis terdeteksi.
                    </p>
                  </div>
                )}

                {paymentData.paymentUrl && (
                  <div className="text-center">
                    <a
                      href={paymentData.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button>Buka Halaman Pembayaran</Button>
                    </a>
                  </div>
                )}

                {polling && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Clock className="h-4 w-4 animate-spin" />
                    <p className="text-sm">Menunggu pembayaran...</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Tutup
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

