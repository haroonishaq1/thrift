import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '../../services/api';
import '../../styles/OtpVerification.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const BrandOtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const brandName = location.state?.brandName;
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/brand/register/step1');
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, 'OTP must be exactly 6 digits')
      .required('Please enter the OTP')
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log('Verifying Brand OTP:', values.otp, 'for email:', email);
      
      const response = await authAPI.brandVerifyOTP(email, values.otp);
      console.log('Brand OTP verification response:', response);

      if (response.success) {
        // Navigate to success page or login page
        navigate('/brand/login', { 
          state: { 
            otpVerified: true,
            registrationComplete: true,
            email: email,
            brandName: brandName,
            message: 'Brand registration completed! Please wait for admin approval before logging in.'
          }
        });
      } else {
        setFieldError('otp', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Brand OTP verification error:', error);
      setFieldError('otp', error.message || 'Verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await authAPI.brandResendOTP(email);
      
      if (response.success) {
        alert('New verification code sent to your email!');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
      } else {
        alert(response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend OTP. Please try again.');
    }
  };

  if (!email) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="otp-page">
      <Header />
      <div className="otp-verification-container">
        <div className="otp-form-wrapper">
          <h1>THRIFT</h1>
          <h2>Brand Email Verification</h2>
          <p className="otp-instruction">
            We've sent a 6-digit verification code to<br />
            <strong>{email}</strong>
          </p>
          {brandName && (
            <p className="brand-name">
              Brand: <strong>{brandName}</strong>
            </p>
          )}

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="otp-form">
                <div className="otp-input-container">
                  <Field name="otp">
                    {({ field, meta }) => (
                      <div>
                        <div className="otp-inputs">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              type="text"
                              maxLength="1"
                              className={`otp-digit ${meta.touched && meta.error ? 'error' : ''}`}
                              value={values.otp[index] || ''}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (/^\d?$/.test(newValue)) {
                                  const newOtp = values.otp.split('');
                                  newOtp[index] = newValue;
                                  setFieldValue('otp', newOtp.join(''));
                                  
                                  // Auto-focus next input
                                  if (newValue && index < 5) {
                                    const nextInput = e.target.parentNode.children[index + 1];
                                    if (nextInput) nextInput.focus();
                                  }
                                }
                              }}
                              onKeyDown={(e) => {
                                // Handle backspace
                                if (e.key === 'Backspace' && !values.otp[index] && index > 0) {
                                  const prevInput = e.target.parentNode.children[index - 1];
                                  if (prevInput) prevInput.focus();
                                }
                              }}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pastedData = e.clipboardData.getData('text').slice(0, 6);
                                if (/^\d{1,6}$/.test(pastedData)) {
                                  setFieldValue('otp', pastedData);
                                }
                              }}
                            />
                          ))}
                        </div>
                        <ErrorMessage name="otp" component="div" className="error-message" />
                      </div>
                    )}
                  </Field>
                </div>

                <button 
                  type="submit" 
                  className="verify-button"
                  disabled={isSubmitting || values.otp.length !== 6}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Code'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="otp-timer">
            {timeLeft > 0 ? (
              <p>Code expires in: <span className="timer">{formatTime(timeLeft)}</span></p>
            ) : (
              <p className="expired">Code has expired</p>
            )}
          </div>

          <div className="resend-section">
            {canResend ? (
              <button 
                className="resend-button" 
                onClick={handleResendOTP}
              >
                Resend Code
              </button>
            ) : (
              <p className="resend-info">
                Didn't receive the code? You can resend in {formatTime(timeLeft)}
              </p>
            )}
          </div>

          <div className="back-to-registration">
            <button 
              className="back-button" 
              onClick={() => navigate('/brand/register/step1')}
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrandOtpVerification;
