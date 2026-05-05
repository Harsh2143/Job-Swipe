import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAeDmzfWjhScxIhmhXp_YPEIVYbImkM2UY');

export default function InterviewPrep({ job, userSkills, onClose }) {
  const [phase, setPhase] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
 

const generateQuestions = async () => {
    setPhase('loading');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Generate 5 interview questions for this job. Mix technical and behavioral.
Role: ${job.role}
Company: ${job.company}
Required Skills: ${job.skills.join(', ')}
Candidate Skills: ${userSkills.join(', ')}
Return ONLY a JSON array, no markdown, nothing else:
[{"id":1,"type":"Technical","question":"...","tip":"..."},{"id":2,"type":"Behavioral","question":"...","tip":"..."}]`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      setQuestions(JSON.parse(clean));
      setPhase('questions');
    } catch (err) {
      console.error(err);
      setPhase('intro');
    }
  };

  const getFeedback = async () => {
    if (!userAnswer.trim()) return;
    setFeedbackLoading(true);
    setPhase('feedback');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert interviewer at ${job.company}.
Question: ${activeQuestion.question}
Candidate Answer: ${userAnswer}
Role: ${job.role}
Return ONLY this JSON, no markdown, nothing else:
{"score":75,"verdict":"Good answer","strengths":"...","improve":"...","ideal":"..."}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const clean = text.replace(/```json|```/g, '').trim();
      setFeedback(JSON.parse(clean));
    } catch (err) {
      console.error(err);
    }
    setFeedbackLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? '#057642' : s >= 60 ? '#b45309' : '#cc1016';

  return (
    <div className="prep-overlay">
      <div className="prep-modal">

        <div className="prep-header">
          <div>
            <h2>🎯 Interview Prep</h2>
            <p>{job.role} at {job.company}</p>
          </div>
          <button className="prep-close" onClick={onClose}>✕</button>
        </div>

        {phase === 'intro' && (
          <div className="prep-intro">
            <div className="prep-intro-icon">🤖</div>
            <h3>AI-Powered Interview Coach</h3>
            <p>Get 5 personalized questions for this role and practice with instant AI feedback.</p>
            <div className="prep-job-info">
              <span className="skill-tag">{job.company}</span>
              {job.skills.slice(0, 3).map(s => (
                <span className="skill-tag highlight" key={s}>{s}</span>
              ))}
            </div>
            <button className="start-btn" onClick={generateQuestions}>
              Generate My Questions →
            </button>
          </div>
        )}

        {phase === 'loading' && (
          <div className="prep-loading">
            <div className="spinner" />
            <p>Generating your questions...</p>
            <span>Analyzing {job.company}'s interview style</span>
          </div>
        )}

        {phase === 'questions' && (
          <div className="prep-questions">
            <p className="prep-subtitle">Tap a question to practice 👇</p>
            {questions.map((q, i) => (
              <div className="prep-question-card" key={q.id} onClick={() => {
                setActiveQuestion(q);
                setUserAnswer('');
                setFeedback(null);
                setPhase('practice');
              }}>
                <div className="prep-question-top">
                  <span className={`q-type ${q.type === 'Technical' ? 'technical' : 'behavioral'}`}>
                    {q.type === 'Technical' ? '💻' : '🧠'} {q.type}
                  </span>
                  <span className="q-number">Q{i + 1}</span>
                </div>
                <p className="q-text">{q.question}</p>
                <p className="q-tip">💡 {q.tip}</p>
                <div className="q-practice-btn">Practice this →</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'practice' && activeQuestion && (
          <div className="prep-practice">
            <button className="back-link" onClick={() => setPhase('questions')}>← Back</button>
            <div className="practice-question">
              <span className={`q-type ${activeQuestion.type === 'Technical' ? 'technical' : 'behavioral'}`}>
                {activeQuestion.type === 'Technical' ? '💻' : '🧠'} {activeQuestion.type}
              </span>
              <p className="q-text" style={{ marginTop: 10 }}>{activeQuestion.question}</p>
              <p className="q-tip">💡 {activeQuestion.tip}</p>
            </div>
            <textarea
              className="answer-input"
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={6}
            />
            <div className="answer-meta">
              <span className="word-count">{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button
                className="start-btn"
                style={{ marginTop: 0, width: 'auto', padding: '12px 24px' }}
                onClick={getFeedback}
                disabled={!userAnswer.trim()}
              >
                Get AI Feedback →
              </button>
            </div>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="prep-feedback">
            {feedbackLoading ? (
              <div className="prep-loading">
                <div className="spinner" />
                <p>Analyzing your answer...</p>
              </div>
            ) : feedback && (
              <>
                <div className="feedback-score-row">
                  <div className="feedback-score" style={{ color: scoreColor(feedback.score) }}>
                    {feedback.score}
                  </div>
                  <div>
                    <p className="feedback-verdict">{feedback.verdict}</p>
                    <p className="feedback-role">{job.role} at {job.company}</p>
                  </div>
                </div>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${feedback.score}%`, background: scoreColor(feedback.score) }} />
                </div>
                <div className="feedback-section green">
                  <h4>✅ Strengths</h4>
                  <p>{feedback.strengths}</p>
                </div>
                <div className="feedback-section orange">
                  <h4>📈 Improve</h4>
                  <p>{feedback.improve}</p>
                </div>
                <div className="feedback-section blue">
                  <h4>💡 Ideal approach</h4>
                  <p>{feedback.ideal}</p>
                </div>
                <div className="feedback-actions">
                  <button className="secondary-btn" onClick={() => { setUserAnswer(''); setFeedback(null); setPhase('practice'); }}>Try Again</button>
                  <button className="primary-btn" onClick={() => setPhase('questions')}>Next Question →</button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}