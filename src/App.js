import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import Dashboard from './components/Dashboard';
import AppliedJobs from './components/AppliedJobs';
import ResumeUpload from './components/ResumeUpload';
import { fetchJobs } from './jobSearch';

export default function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobError, setJobError] = useState(null);
  const [page, setPage] = useState(1);

  const loadJobs = useCallback(async (skills, pageNum = 1) => {
    setLoadingJobs(true);
    setJobError(null);
    try {
      const newJobs = await fetchJobs(skills, pageNum);
      if (pageNum === 1) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setJobError('Failed to load jobs. Please try again.');
    }
    setLoadingJobs(false);
  }, []);

  const handleSkillsExtracted = (skills) => {
    setUserSkills(skills);
    setCurrentView('swipe');
    loadJobs(skills, 1);
  };

  // Load more jobs when user is near the end
  useEffect(() => {
    if (jobs.length > 0 && currentIndex >= jobs.length - 2 && !loadingJobs) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadJobs(userSkills, nextPage);
    }
  }, [currentIndex, jobs.length, loadingJobs, page, userSkills, loadJobs]);

  const currentJob = jobs[currentIndex];
  const isFinished = !loadingJobs && jobs.length > 0 && currentIndex >= jobs.length;

  const handleSwipe = (direction, aiScore) => {
    if (direction === 'right' || direction === 'super') {
      setAppliedJobs(prev => [...prev, { ...currentJob, aiScore }]);
    } else {
      setSkippedJobs(prev => [...prev, currentJob]);
    }
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="app">
      {currentView !== 'upload' && (
        <Navbar
          appliedCount={appliedJobs.length}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}

      <div className="main-content">
        {currentView === 'upload' && (
          <ResumeUpload onSkillsExtracted={handleSkillsExtracted} />
        )}

        {currentView === 'swipe' && (
          <div className="swipe-view">
            {loadingJobs && jobs.length === 0 ? (
              <div className="finished-card">
                <div className="spinner" />
                <h2 style={{ marginTop: 16 }}>Finding jobs for you...</h2>
                <p>Searching for {userSkills.slice(0, 3).join(', ')} roles</p>
              </div>
            ) : jobError && jobs.length === 0 ? (
              <div className="finished-card">
                <div className="finished-icon">😕</div>
                <h2>Couldn't load jobs</h2>
                <p>{jobError}</p>
                <button className="primary-btn" onClick={() => loadJobs(userSkills, 1)}>
                  Try Again
                </button>
              </div>
            ) : isFinished ? (
              <div className="finished-card">
                <div className="finished-icon">🎉</div>
                <h2>All caught up!</h2>
                <p>You've seen all {jobs.length} jobs</p>
                <p className="finished-sub">Applied to <strong>{appliedJobs.length}</strong> positions</p>
                <div className="finished-actions">
                  <button className="primary-btn" onClick={() => setCurrentView('applied')}>
                    View Applications
                  </button>
                  <button className="secondary-btn" onClick={() => {
                    setCurrentIndex(0);
                    setAppliedJobs([]);
                    setSkippedJobs([]);
                    setPage(1);
                    loadJobs(userSkills, 1);
                  }}>
                    Find More Jobs
                  </button>
                </div>
              </div>
            ) : currentJob ? (
              <JobCard
                job={currentJob}
                onSwipe={handleSwipe}
                index={currentIndex}
                total={jobs.length}
                userSkills={userSkills}
              />
            ) : null}
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            appliedJobs={appliedJobs}
            skippedJobs={skippedJobs}
            totalSeen={currentIndex}
            userSkills={userSkills}
          />
        )}

        {currentView === 'applied' && (
          <AppliedJobs appliedJobs={appliedJobs} />
        )}
      </div>
    </div>
  );
}