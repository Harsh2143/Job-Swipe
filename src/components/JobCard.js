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
    if (score >= 80) return '#057642';
    if (score >= 60) return '#b45309';
    return '#cc1016';
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
          <div className="company-logo">{companyEmojis[job.company] || '🏢'}</div>
          <div>
            <h2 className="job-role">{job.role}</h2>
            <p className="job-company">{job.company} • {job.location}</p>
          </div>
        </div>

        <div className="job-meta">
          <span className="stipend-tag">💰 {job.stipend}</span>
          <span className="type-tag">📅 Internship</span>
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
            <>
              <div className="score-header">
                <span className="score-label-text">🤖 AI Match Score</span>
                <div className="score-right">
                  <span className="score-match-label" style={{ color: getScoreColor(aiData.score) }}>
                    {getScoreLabel(aiData.score)}
                  </span>
                  <span className="score-number" style={{ color: getScoreColor(aiData.score) }}>
                    {aiData.score}%
                  </span>
                </div>
              </div>
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{
                  width: `${aiData.score}%`,
                  background: getScoreColor(aiData.score)
                }} />
              </div>
              <p className="ai-reason">"{aiData.reason}"</p>
            </>
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