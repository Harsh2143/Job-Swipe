import React from 'react';

export default function Dashboard({ appliedJobs, skippedJobs, totalSeen, userSkills }) {
  const avgScore = appliedJobs.length > 0
    ? Math.round(appliedJobs.reduce((sum, j) => sum + (j.aiScore || 0), 0) / appliedJobs.length)
    : 0;

  const topDomains = appliedJobs.reduce((acc, job) => {
    acc[job.domain] = (acc[job.domain] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Jobs Seen', value: totalSeen, icon: '👀', color: '#0a66c2' },
    { label: 'Applied', value: appliedJobs.length, icon: '✅', color: '#057642' },
    { label: 'Skipped', value: skippedJobs.length, icon: '⏭️', color: '#cc1016' },
    { label: 'Avg Match', value: `${avgScore}%`, icon: '🤖', color: '#b45309' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>📊 Your Job Search Dashboard</h2>
        <p>Track your applications and match performance</p>
      </div>

      <div className="stats-grid">
        {stats.map(stat => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <h3>🎯 Your Skills</h3>
        <div className="skills-row">
          {userSkills.map(skill => (
            <span className="skill-tag highlight" key={skill}>{skill}</span>
          ))}
        </div>
      </div>

      {Object.keys(topDomains).length > 0 && (
        <div className="dashboard-section">
          <h3>📁 Applied by Domain</h3>
          {Object.entries(topDomains).map(([domain, count]) => (
            <div className="domain-bar" key={domain}>
              <div className="domain-bar-label">
                <span>{domain}</span>
                <span>{count} job{count > 1 ? 's' : ''}</span>
              </div>
              <div className="domain-bar-bg">
                <div className="domain-bar-fill" style={{
                  width: `${(count / appliedJobs.length) * 100}%`
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {appliedJobs.length === 0 && (
        <div className="empty-dashboard">
          <p>🔍 Start swiping to see your stats here!</p>
        </div>
      )}
    </div>
  );
}