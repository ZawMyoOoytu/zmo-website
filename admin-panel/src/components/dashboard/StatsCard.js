import React from 'react';
import './StatsCard.css';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  breakdown = [],
  trend,
  trendValue,
  subtitle,
  onClick 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
    }
    return val;
  };

  const getTrendInfo = () => {
    if (!trend) return null;
    
    const isPositive = typeof trend === 'string' 
      ? trend.includes('+')
      : trend > 0;
    
    const trendText = typeof trend === 'string' ? trend : `${trend > 0 ? '+' : ''}${trend}%`;
    
    return {
      isPositive,
      text: trendText,
      icon: isPositive ? '↗' : '↘'
    };
  };

  const trendInfo = getTrendInfo();

  return (
    <div 
      className={`stats-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      {/* Background decorative element */}
      <div className="stats-card-bg"></div>
      
      <div className="stats-header">
        <div className="stats-content">
          <h3 className="stats-title">{title}</h3>
          <div className="stats-value-container">
            <span className="stats-value">
              {formatValue(value)}
            </span>
            {trendInfo && (
              <span className={`stats-trend ${trendInfo.isPositive ? 'positive' : 'negative'}`}>
                <span className="trend-icon">{trendInfo.icon}</span>
                {trendInfo.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="stats-subtitle">{subtitle}</p>
          )}
        </div>
        
        <div className="stats-icon-wrapper">
          <div className="stats-icon">
            {icon}
          </div>
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="stats-breakdown">
          {breakdown.map((item, index) => (
            <div key={index} className="breakdown-item">
              <div className="breakdown-label">
                <span 
                  className="breakdown-dot" 
                  style={{ backgroundColor: item.color }}
                ></span>
                <span>{item.label}</span>
              </div>
              <span className="breakdown-value">
                {formatValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar for breakdown items */}
      {breakdown.length > 0 && breakdown.some(item => item.percentage) && (
        <div className="breakdown-progress">
          {breakdown.map((item, index) => (
            item.percentage && (
              <div
                key={index}
                className="progress-bar-segment"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }}
                title={`${item.label}: ${item.percentage}%`}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

// Default props for consistent usage
StatsCard.defaultProps = {
  color: 'primary',
  breakdown: []
};

export default StatsCard;