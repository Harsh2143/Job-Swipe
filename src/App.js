import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import JobCard from './components/JobCard';
import Dashboard from './components/Dashboard';
import AppliedJobs from './components/AppliedJobs';
import ResumeUpload from './components/ResumeUpload';

const JOBS = [
  {
    id: 1, role: "Frontend Developer Intern", company: "Google",
    location: "Bangalore, India", stipend: "₹50,000/month",
    skills: ["React", "JavaScript", "CSS"], domain: "Web Development",
    description: "Work on Google's internal dashboards and consumer-facing web products with the UI team."
  },
  {
    id: 2, role: "ML Engineer Intern", company: "Microsoft",
    location: "Hyderabad, India", stipend: "₹60,000/month",
    skills: ["Python", "TensorFlow", "Data Analysis"], domain: "Artificial Intelligence",
    description: "Build and deploy machine learning models for Azure cloud services."
  },
  {
    id: 3, role: "Backend Developer Intern", company: "Flipkart",
    location: "Bangalore, India", stipend: "₹40,000/month",
    skills: ["Node.js", "MongoDB", "REST APIs"], domain: "Backend Development",
    description: "Design scalable APIs handling millions of requests for India's largest e-commerce platform."
  },
  {
    id: 4, role: "Data Science Intern", company: "Swiggy",
    location: "Bangalore, India", stipend: "₹45,000/month",
    skills: ["Python", "SQL", "Machine Learning"], domain: "Data Science",
    description: "Analyze delivery patterns and build predictive models to optimize Swiggy's logistics."
  },
  {
    id: 5, role: "Android Developer Intern", company: "Paytm",
    location: "Noida, India", stipend: "₹35,000/month",
    skills: ["Kotlin", "Android SDK", "Firebase"], domain: "Mobile Development",
    description: "Develop new features for Paytm's Android app used by 300M+ users."
  },
  {
    id: 6, role: "Full Stack Developer Intern", company: "Amazon",
    location: "Bangalore, India", stipend: "₹55,000/month",
    skills: ["React", "Node.js", "AWS", "MongoDB"], domain: "Web Development",
    description: "Build internal tools and customer-facing features for Amazon India's marketplace team."
  },
  {
    id: 7, role: "Data Analyst Intern", company: "Infosys",
    location: "Pune, India", stipend: "₹25,000/month",
    skills: ["Python", "SQL", "Tableau", "Excel"], domain: "Data Science",
    description: "Analyze large datasets to derive business insights for enterprise clients."
  },
  {
    id: 8, role: "DevOps Intern", company: "Wipro",
    location: "Chennai, India", stipend: "₹30,000/month",
    skills: ["Docker", "Kubernetes", "CI/CD", "Linux"], domain: "DevOps",
    description: "Maintain and improve CI/CD pipelines and cloud infrastructure for enterprise projects."
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [skippedJobs, setSkippedJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);

  const currentJob = JOBS[currentIndex];
  const isFinished = currentIndex >= JOBS.length;

  const handleSkillsExtracted = (skills) => {
    setUserSkills(skills);
    setCurrentView('swipe');
  };

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
            {isFinished ? (
              <div className="finished-card">
                <div className="finished-icon">🎉</div>
                <h2>All caught up!</h2>
                <p>You've seen all {JOBS.length} jobs</p>
                <p className="finished-sub">Applied to <strong>{appliedJobs.length}</strong> positions</p>
                <div className="finished-actions">
                  <button className="primary-btn" onClick={() => setCurrentView('applied')}>
                    View Applications
                  </button>
                  <button className="secondary-btn" onClick={() => {
                    setCurrentIndex(0);
                    setAppliedJobs([]);
                    setSkippedJobs([]);
                  }}>
                    Start Over
                  </button>
                </div>
              </div>
            ) : (
              <JobCard
                job={currentJob}
                onSwipe={handleSwipe}
                index={currentIndex}
                total={JOBS.length}
                userSkills={userSkills}
              />
            )}
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