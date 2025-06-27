"use client";
import { useResendOtpMutation, useVerifyOtpMutation } from '@/features/auth/authApi';
import { notification } from 'antd';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const otpInputRefs = useRef([]);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();

  const router = useRouter();

  // Handle OTP input change
  const handleChange = useCallback((e, index) => {
    const value = e.target.value;
    
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto focus to next input
      if (value && index < 3) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  }, [otp]);

  // Handle paste
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 4);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
    }
  }, [otp]);

  // Handle backspace
  const handleKeyDown = useCallback((e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4 || !/^\d+$/.test(otpValue)) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyOtp({ email, oneTimeCode: parseFloat(otpValue) }).unwrap();
      
      // Show custom success modal
      setSuccessMessage(result?.message || 'Your OTP has been verified');
      setShowSuccessModal(true);
      
      // Hide modal and redirect after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/auth/login');
      }, 2000);
      
    } catch (err) {
      notification.error({
        message: 'Verification Failed',
        description: err?.data?.message || 'Invalid OTP. Please try again.',
      });
      setError(err?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, otp, router, verifyOtp]);

  // Handle resend OTP
  const handleResendOtp = useCallback(async () => {
    if (isResendDisabled) return;
    
    try {
      await resendOtp({ email: email }).unwrap();
      setTimer(60);
      setIsResendDisabled(true);
      
      notification.success({
        message: 'OTP Resent',
        description: 'A new OTP has been sent to your email',
      });
    } catch (err) {
      notification.error({
        message: 'Failed to Resend',
        description: err?.data?.message || 'Failed to resend OTP. Please try again.',
      });
    }
  }, [email, isResendDisabled, resendOtp]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);

  return (
    <div className="">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="text-center">
              <svg 
                className="mx-auto h-12 w-12 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mt-3">Verification Successful!</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {successMessage}
                </p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full animate-[countdown_2s_linear_forwards]" 
                    style={{ animation: 'countdown 2s linear forwards' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen justify-center">
        {/* Left Section with Background Image */}
        <div className="hidden md:flex md:w-1/2 justify-center relative">
          <Image 
            src="/images/login.png" 
            alt="People smiling" 
            layout="fill" 
            objectFit="cover"
            loading='lazy'
            loader={() => '/images/login.png'}
          />
        </div>

        {/* Right Section with OTP Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md bg-white rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Verify OTP</h2>
              <p className="text-gray-600 mt-1">
                Enter the 4-digit code sent to your email
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-6">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => otpInputRefs.current[index] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className={`w-12 h-12 text-center text-xl border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full cursor-pointer bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${
                  (isSubmitting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                aria-label="Verify OTP"
              >
                {(isSubmitting || isLoading) ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify OTP'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Didn't receive code?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={isResendDisabled || isResendLoading}
                  className={`font-medium ${
                    isResendDisabled || isResendLoading 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-indigo-600 hover:text-indigo-500'
                  }`}
                  aria-label={isResendDisabled ? `Resend OTP in ${timer} seconds` : 'Resend OTP'}
                >
                  {isResendLoading ? 'Sending...' : isResendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for the progress bar animation */}
      <style jsx>{`
        @keyframes countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default VerifyOTPPage;