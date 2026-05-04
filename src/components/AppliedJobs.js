import React from 'react';

export default function AppliedJobs({ appliedJobs }) {
  const getScoreColor = (score) => {
    if (score >= 80) return '#057642';
    if (score >= 60) return '#b45309';
    return '#cc1016';
  };

  const handleExport = () => {
    const rows = appliedJobs.map(j =>
      `${j.role} | ${j.company} | ${j.location} | ${j.stipend} | Match: ${j.aiScore || 'N/A'}%`
    ).join('\n');
    const blob = new Blob([`JobSwipe - Applied Jobs\n\n${rows}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applied_jobs.txt';
    a.click();
  };

  return (
    <div className="applied-page">
      <div className="applied-header">
        <div>
          <h2>✅ Applied Jobs</h2>
          <p>{appliedJobs.length} application{appliedJobs.length !== 1 ? 's' : ''} so far</p>
        </div>
        {appliedJobs.length > 0 && (
          <button className="export-btn" onClick={handleExport}>
            ⬇️ Export
          </button>
        )}
      </div>

      {appliedJobs.length === 0 ? (
        <div className="empty-applied">
          <div className="empty-icon">📭</div>
          <h3>No applications yet</h3>
          <p>Swipe right on jobs you like to apply!</p>
        </div>
      ) : (
        <div className="applied-list">
          {appliedJobs.map((job, i) => (
            <div className="applied-card" key={i}>
              <div className="applied-card-top">
                <div>
                  <h3>{job.role}</h3>
                  <p className="applied-company">{job.company} • {job.location}</p>
                </div>
                {job.aiScore && (
                  <div className="applied-score" style={{ color: getScoreColor(job.aiScore) }}>
                    <span className="applied-score-num">{job.aiScore}%</span>
                    <span className="applied-score-label">match</span>
                  </div>
                )}
              </div>
              <div className="applied-card-bottom">
                <span className="stipend-tag">💰 {job.stipend}</span>
                <span className="domain-badge">{job.domain}</span>
              </div>
              <div className="skills-row" style={{ marginTop: 10 }}>
                {job.skills.map(s => <span className="skill-tag" key={s}>{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}