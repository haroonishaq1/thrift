import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '../services/api';
import { storeUserAuth } from '../utils/auth';
import '../styles/OtpVerification.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OtpVerification = ({ updateAuthStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/signup');
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
  });  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log('Verifying OTP:', values.otp, 'for email:', email);
      
      const response = await authAPI.verifyOTP(email, values.otp);
      
      if (response.success) {
        // Store authentication data using proper auth utilities
        if (response.data.token && response.data.user) {
          storeUserAuth(response.data.token, response.data.user);
          
          // Update authentication status in parent App component
          if (updateAuthStatus) {
            updateAuthStatus();
          }
          
          console.log('✅ User automatically logged in after OTP verification');
        }
        
        // Success - redirect to home page
        navigate('/', { 
          state: { 
            message: 'Account verified successfully! Welcome to Project Thrift.',
            type: 'success'
          }
        });
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setFieldError('otp', error.message || 'Invalid OTP. Please try again.');
    }
    setSubmitting(false);
  };
  const handleResendOtp = async () => {
    try {
      console.log('Resending OTP to:', email);
      
      const response = await authAPI.resendOTP(email);
      
      if (response.success) {
        // Reset timer
        setTimeLeft(300);
        setCanResend(false);
        
        alert('A new OTP has been sent to your email address.');
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      alert(`Failed to resend OTP: ${error.message}`);
    }
  };

  if (!email) {
    return <div>Loading...</div>;
  }

  return (
    <div className="otp-verification">
      <Header />
      
      <div className="otp-container">
        <div className="otp-card">
          <div className="otp-header">
            <h2>Verify Your Email</h2>
            <p>We've sent a 6-digit verification code to</p>
            <span className="email-display">{email}</span>
          </div>

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="otp-form">
                <div className="otp-input-group">
                  <label htmlFor="otp">Enter Verification Code</label>
                  <div className="otp-input-container">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        className="otp-digit"
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
                      />
                    ))}
                  </div>
                  <ErrorMessage name="otp" component="div" className="error-message" />
                </div>

                <div className="timer-section">
                  {!canResend ? (
                    <p className="timer-text">
                      Code expires in: <span className="timer">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResendOtp}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || values.otp.length !== 6}
                  className="verify-btn"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Email'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="otp-footer">
            <p>Didn't receive the code? Check your spam folder or</p>
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/signup')}
            >
              try a different email address
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OtpVerification;
