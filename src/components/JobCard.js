import React, { useEffect, useState } from 'react';
import { getMatchScore } from '../aiMatch';
import InterviewPrep from './InterviewPrep';

export default function JobCard({ job, onSwipe, index, total, userSkills }) {
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);
  const [swiping, setSwiping] = useState(null);
  const [showPrep, setShowPrep] = useState(false);

  useEffect(() => {
    setAiData(null);
    setLoadingAI(true);
    getMatchScore(job, userSkills).then(data => {
      setAiData(data);
      setLoadingAI(false);
    });
  }, [job, userSkills]);

  const handleSwipe = (dir) => {
    setSwiping(dir);
    setTimeout(() => {
      onSwipe(dir, aiData?.score);
      setSwiping(null);
    }, 400);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Good Match';
    return 'Weak Match';
  };

  const companyEmojis = {
    'Google': '🔵', 'Microsoft': '🟩', 'Flipkart': '🛒',
    'Swiggy': '🧡', 'Paytm': '💙', 'Amazon': '📦',
    'Infosys': '🔷', 'TCS': '🏢', 'Wipro': '⚙️'
  };

  return (
    <div className="card-wrapper">
      <div className="card-stack card-stack-2" />
      <div className="card-stack card-stack-1" />
      <div className={`job-card ${swiping === 'right' ? 'swipe-right' : ''} ${swiping === 'left' ? 'swipe-left' : ''}`}>

        <div className="card-top-bar">
          <span className="card-progress">{index + 1} of {total} jobs</span>
          <span className="domain-badge">{job.domain}</span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        <div className="card-company-row">
          {job.employerLogo ? (
            <img src={job.employerLogo} alt={job.company} className="company-logo-img" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <div className="company-logo" style={job.employerLogo ? { display: 'none' } : {}}>{companyEmojis[job.company] || '🏢'}</div>
          <div>
            <h2 className="job-role">{job.role}</h2>
            <p className="job-company">{job.company} • {job.location}</p>
          </div>
        </div>

        <div className="job-meta">
          <span className="stipend-tag">💰 {job.stipend}</span>
          <span className="type-tag">📋 {job.domain}</span>
          {job.isRemote && <span className="type-tag">🌍 Remote</span>}
        </div>

        <p className="job-description">{job.description}</p>

        <div className="skills-row">
          {job.skills.map(skill => (
            <span className="skill-tag" key={skill}>{skill}</span>
          ))}
        </div>

        <div className="ai-score-box">
          {loadingAI ? (
            <div className="ai-loading">
              <div className="spinner-small" />
              <span>AI analyzing your fit...</span>
            </div>
          ) : aiData ? (
            <div className="score-ring-container">
              <svg className="score-ring" viewBox="0 0 70 70">
                <circle className="score-ring-bg" cx="35" cy="35" r="28" />
                <circle className="score-ring-fill" cx="35" cy="35" r="28"
                  style={{
                    stroke: getScoreColor(aiData.score),
                    strokeDasharray: `${2 * Math.PI * 28}`,
                    strokeDashoffset: `${2 * Math.PI * 28 * (1 - aiData.score / 100)}`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center'
                  }} />
                <text className="score-ring-text" x="35" y="35">{aiData.score}</text>
              </svg>
              <div className="score-info">
                <span className="score-label-text">🤖 AI Match</span>
                <span className="score-match-label" style={{ color: getScoreColor(aiData.score) }}>
                  {getScoreLabel(aiData.score)}
                </span>
                <p className="ai-reason">"{aiData.reason}"</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="swipe-buttons">
          <button className="swipe-btn skip" onClick={() => handleSwipe('left')}>
            <span className="btn-icon">✕</span>
            <span className="btn-label">Skip</span>
          </button>
          <button className="swipe-btn superlike" onClick={() => handleSwipe('super')}>
            <span className="btn-icon">⭐</span>
            <span className="btn-label">Save</span>
          </button>
          <button className="swipe-btn apply" onClick={() => handleSwipe('right')}>
            <span className="btn-icon">✓</span>
            <span className="btn-label">Apply</span>
          </button>
        </div>

        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="prep-trigger-btn" style={{ textDecoration: 'none', textAlign: 'center', background: '#0a66c2', color: '#fff' }}>
            🔗 Apply on Company Site
          </a>
        )}

        <button className="prep-trigger-btn" onClick={() => setShowPrep(true)}>
          🎯 Practice Interview for this Role
        </button>

        {showPrep && (
          <InterviewPrep
            job={job}
            userSkills={userSkills}
            onClose={() => setShowPrep(false)}
          />
        )}

      </div>
    </div>
  );
}