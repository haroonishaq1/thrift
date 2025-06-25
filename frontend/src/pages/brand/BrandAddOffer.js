import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { getBrandToken, isBrandAuthenticated, getBrandAuthHeaders } from '../../utils/auth';
import '../../styles/brand/BrandAddOffer.css';

function BrandAddOffer() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  // Check for token and redirect to login if not present
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);
  
  // Offer validation schema
  const validationSchema = Yup.object({
    offerName: Yup.string()
      .required('Offer name is required')
      .max(50, 'Offer name must not exceed 50 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(500, 'Description must not exceed 500 characters'),
    offerImage: Yup.mixed()
      .required('Offer image is required')
      .test('fileFormat', 'Only .png, .jpg, .jpeg, and .svg files are accepted', value => {
        if (!value) return true;
        return ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(value.type);
      }),
    discountPercentage: Yup.number()
      .required('Discount percentage is required')
      .min(1, 'Discount must be at least 1%')
      .max(100, 'Discount cannot exceed 100%')
  });
  
  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    
    if (file) {
      // Check if file is one of the allowed types
      if (['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'].includes(file.type)) {
        setFieldValue('offerImage', file);
        
        // Create a preview for the image
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the input and set field error
        event.target.value = null;
        setFieldValue('offerImage', null);
      }
    }
  };  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitError(null);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('title', values.offerName);
      formData.append('description', values.description);
      formData.append('discount_percent', values.discountPercentage);
      
      // Append the image file if it exists
      if (values.offerImage) {
        formData.append('offerImage', values.offerImage);
      }      // Get the token using our utility function
      const token = getBrandToken();
      if (!token) {
        throw new Error('You are not authenticated. Please login again.');
      }
      
      // Call the API to create a new offer using auth headers      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/offers`, 
        {
          method: 'POST',
          headers: getBrandAuthHeaders(),
          body: formData
        }
      );
      
      // Handle non-2xx responses
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('brand-token');
          localStorage.removeItem('brand-data');
          navigate('/brand/login');
          throw new Error('Authentication expired. Please log in again.');
        }
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create offer');
      }
      
      // Reset form and preview
      resetForm();
      setImagePreview(null);
      
      // Navigate to offers list page
      navigate('/brand/offers');
    } catch (error) {
      console.error('Error creating offer:', error);
      setSubmitError(error.message || 'An error occurred while creating the offer');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="brand-add-offer-container">
      <div className="brand-add-offer-form-wrapper">        <h2>Add New Offer</h2>
        {submitError && (
          <div className="error-banner">
            <p>{submitError}</p>
            <button onClick={() => setSubmitError(null)}>✕</button>
          </div>
        )}
        <Formik
          initialValues={{
            offerName: '',
            description: '',
            offerImage: null,
            discountPercentage: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, errors, touched, isSubmitting }) => (
            <Form className="brand-add-offer-form">
              <div className="form-group">
                <label htmlFor="offerName">Offer Name</label>
                <Field 
                  id="offerName" 
                  name="offerName" 
                  type="text" 
                  placeholder="Enter offer name"
                />
                <ErrorMessage name="offerName" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Field 
                  as="textarea"
                  id="description" 
                  name="description" 
                  rows="4"
                  placeholder="Enter offer description"
                />
                <ErrorMessage name="description" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="discountPercentage">Discount Percentage</label>
                <Field 
                  id="discountPercentage" 
                  name="discountPercentage" 
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="Enter discount percentage"
                />
                <ErrorMessage name="discountPercentage" component="div" className="error-message" />
              </div>
              
              <div className="form-group">
                <label htmlFor="offerImage">Offer Image</label>
                <div className="file-input-container">
                  <input
                    id="offerImage"
                    name="offerImage"
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(event) => handleImageChange(event, setFieldValue)}
                    className="file-input"
                  />
                  <div className="file-input-label">Choose File</div>
                </div>
                {errors.offerImage && touched.offerImage && (
                  <div className="error-message">{errors.offerImage}</div>
                )}
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Offer Preview" className="image-preview" />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => navigate('/brand/offers')}
                >
                  Cancel
                </button>
                <button type="submit" className="save-offer-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default BrandAddOffer;
