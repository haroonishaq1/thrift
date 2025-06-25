import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { isBrandAuthenticated } from '../../utils/auth';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../styles/brand/BrandAnalytics.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function BrandAnalytics() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    deleted: 0
  });
  const [activeOffer, setActiveOffer] = useState(null);  const [monthlyData, setMonthlyData] = useState([]);
  const [yearsList, setYearsList] = useState([]);

  // Check for token and redirect to login if not present
  useEffect(() => {
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
    }
  }, [navigate]);
  
  // Load offers data
  useEffect(() => {
    // In a real application, this would be an API call
    const storedOffers = JSON.parse(localStorage.getItem('brandOffers') || '[]');
    
    // Get deleted offers count from localStorage (if available)
    const deletedCount = parseInt(localStorage.getItem('deletedOffersCount') || '0');
      // Create a list of the last 10 years for the filter
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 10 }, (_, i) => currentYear - i);
    
    setYearsList(pastYears);
    
    // Set default selected year to the current year if not already set
    if (!selectedYear) {
      setSelectedYear(currentYear);
    }
    
    setOffers(storedOffers);
    
    // Update deleted count in stats
    setStats(prevStats => ({
      ...prevStats,
      deleted: deletedCount
    }));
    
  }, [selectedYear]);
  
  // Calculate statistics whenever offers change
  useEffect(() => {
    const now = new Date();
    
    // Find active offer
    const active = offers.find(offer => {
      const expiryDate = new Date(offer.expiryDate);
      return now < expiryDate;
    });
    
    // Count active and expired offers
    const activeCount = offers.filter(offer => {
      const expiryDate = new Date(offer.expiryDate);
      return now < expiryDate;
    }).length;
    
    const expiredCount = offers.filter(offer => {
      const expiryDate = new Date(offer.expiryDate);
      return now >= expiryDate;
    }).length;
    
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      total: offers.length,
      active: activeCount,
      expired: expiredCount
    }));
    
    // Set active offer details
    setActiveOffer(active);
    
    // Generate monthly data for selected year
    generateMonthlyData(selectedYear);
    
  }, [offers, selectedYear]);
    // Generate data for monthly offers chart
  const generateMonthlyData = (year) => {
    // Initialize array with zeros for all months
    const monthsData = Array(12).fill(0);
    
    // Count offers by month for the selected year
    offers.forEach(offer => {
      const offerDate = new Date(offer.createdAt);
      const offerYear = offerDate.getFullYear();
      
      if (offerYear === year) {
        const month = offerDate.getMonth();
        monthsData[month]++;
      }
    });
    
    setMonthlyData(monthsData);
  };
  
  // Check if the latest offer has expired
  const isLatestOfferExpired = () => {
    if (offers.length === 0) return true;
    
    // Sort offers by creation date (newest first)
    const sortedOffers = [...offers].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    const latestOffer = sortedOffers[0];
    const now = new Date();
    const expiryDate = new Date(latestOffer.expiryDate);
    
    return now > expiryDate;
  };
  
  // Format a date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Chart configurations
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyChartData = {
    labels: monthNames,
    datasets: [
      {
        label: 'Offers Created',
        data: monthlyData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  const statusChartData = {
    labels: ['Active', 'Expired', 'Deleted'],
    datasets: [
      {
        data: [stats.active, stats.expired, stats.deleted],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Offers Created in ${selectedYear}`,
      },
    },
  };
  
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Offers Status Distribution',
      },
    },
  };
  
  return (
    <div className="brand-analytics-container">
      <div className="analytics-header">
        <h2>Brand Analytics Dashboard</h2>
        <div className="year-filter">
          <label htmlFor="yearSelect">Select Year:</label>
          <select 
            id="yearSelect"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {yearsList.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="stats-cards-container">
        <div className="stats-card">
          <h3>Total Offers</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stats-card active">
          <h3>Active Offers</h3>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stats-card expired">
          <h3>Expired Offers</h3>
          <div className="stat-value">{stats.expired}</div>
        </div>
        <div className="stats-card deleted">
          <h3>Deleted Offers</h3>
          <div className="stat-value">{stats.deleted}</div>
        </div>
      </div>
        {activeOffer ? (        <div className="active-offer-details">
          <h3>Currently Active Offer</h3>
          <div className="active-offer-card">
            <div className="offer-img-container">
              <img src={activeOffer.offerImage} alt={activeOffer.offerName} />
            </div>
            <div className="offer-details">
              <div className="offer-header">
                <span className="offer-label">Name:</span>
                <h4>{activeOffer.offerName}</h4>
              </div>
              
              <div className="offer-discount">
                <span className="meta-label">Discount:</span>
                <span className="discount-value">{activeOffer.discountPercentage}% OFF</span>
              </div>
              
              <div className="offer-description-section">
                <span className="offer-label">Description:</span>
                <div className="offer-description">
                  <p>{activeOffer.description}</p>
                </div>
              </div>
              
              <div className="offer-meta">
                <div className="meta-item">
                  <span className="meta-label">Created On:</span>
                  <span className="meta-value">{formatDate(activeOffer.createdAt)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Expires On:</span>
                  <span className="meta-value expiry-time">{formatDate(activeOffer.expiryDate)}</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span className="meta-value status-active">Active</span>
                </div>
                
                <div className="meta-item">
                  <span className="meta-label">Time Remaining:</span>
                  <span className="meta-value">
                    {(() => {
                      const now = new Date();
                      const expiry = new Date(activeOffer.expiryDate);
                      const diff = expiry - now;
                      
                      if (diff <= 0) return "Expired";
                      
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      
                      return `${hours}h ${minutes}m`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-offer-details no-active-offer">
          <h3>Currently Active Offer</h3>
          <div className="no-active-offer-message">
            <p>You don't have any active offers right now.</p>
            <button 
              className="create-offer-button" 
              onClick={() => navigate('/brand/add-offer')}
              disabled={!isLatestOfferExpired()}
            >
              Create New Offer
            </button>
          </div>
        </div>
      )}
      
      <div className="charts-container">
        <div className="chart-wrapper monthly-chart">
          <h3>Monthly Offer Creation Activity</h3>
          <div className="chart-container">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>
        
        <div className="chart-wrapper status-chart">
          <h3>Offers Status Distribution</h3>
          <div className="chart-container pie-chart">
            <Pie data={statusChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
      
      <div className="analytics-actions">
        <button 
          onClick={() => navigate('/brand/dashboard')}
          className="back-button"
        >
          Back to Dashboard
        </button>
        <button 
          onClick={() => navigate('/brand/offers')}
          className="view-offers-button"
        >
          View All Offers
        </button>
      </div>
    </div>
  );
}

export default BrandAnalytics;
