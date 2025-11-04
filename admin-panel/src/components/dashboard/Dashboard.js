import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Blog Posts', value: 12, color: '#3b82f6', icon: '📝' },
    { title: 'Projects', value: 5, color: '#22c55e', icon: '💼' },
    { title: 'Messages', value: 3, color: '#f59e0b', icon: '✉️' }
  ];

  const activities = [
    { icon: '📝', text: 'New blog post created', time: '2 hours ago' },
    { icon: '💼', text: 'Project updated', time: '5 hours ago' },
    { icon: '✉️', text: 'New contact message received', time: '1 day ago' }
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Stats Section */}
      <section className="dashboard-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Activity */}
      <section className="recent-activity-section">
        <h2>Recent Activity</h2>
        <ul className="activity-list">
          {activities.map((activity, i) => (
            <li key={i}>
              <span className="activity-icon">{activity.icon}</span>
              <span className="activity-text">{activity.text}</span>
              <span className="activity-time">{activity.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;
