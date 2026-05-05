import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAP6vezBojykl78SQmQBmAQ4KPNI7G_OZg');

async function callAI(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

function ManualSkills({ onSkillsExtracted }) {
  const [input, setInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [checking, setChecking] = useState(false);
  const [rejected, setRejected] = useState(null);

  const addSkill = async (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = input.trim().replace(',', '');
      if (!skill || skills.includes(skill)) { setInput(''); return; }

      setChecking(true);
      setRejected(null);
      try {
        const response = await callAI(
          `Is "${skill}" a real technical skill, programming language, framework, tool, software, or professional skill used in jobs? Reply with ONLY "yes" or "no", nothing else.`
        );
        const answer = response.trim().toLowerCase();
        if (answer.startsWith('yes')) {
          setSkills(prev => [...prev, skill]);
          setInput('');
        } else {
          setRejected(`"${skill}" doesn't look like a technical skill.`);
          setTimeout(() => setRejected(null), 3000);
        }
      } catch (err) {
        console.error('Skill validation error:', err);
        // On API error, allow the skill through rather than blocking the user
        setSkills(prev => [...prev, skill]);
        setInput('');
      }
      setChecking(false);
    }
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="manual-skills">
      <div style={{ position: 'relative' }}>
        <input
          className="skill-input"
          type="text"
          placeholder="Type a skill and press Enter (e.g. Python)"
          value={input}
          onChange={e => { setInput(e.target.value); setRejected(null); }}
          onKeyDown={addSkill}
          disabled={checking}
        />
        {checking && (
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50)',
            fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            Checking...
          </span>
        )}
      </div>
      {rejected && (
        <p style={{ color: '#e53e3e', fontSize: 13, margin: '8px 0 0', fontWeight: 500 }}>
          ⚠️ {rejected}
        </p>
      )}
      {skills.length > 0 && (
        <>
          <div className="skills-row" style={{ marginTop: 12 }}>
            {skills.map(skill => (
              <span className="skill-tag highlight" key={skill}>
                {skill}
                <button className="remove-skill" onClick={() => removeSkill(skill)}>×</button>
              </span>
            ))}
          </div>
          <button className="start-btn" onClick={() => onSkillsExtracted(skills)}>
            Start Swiping Jobs →
          </button>
        </>
      )}
    </div>
  );
}

export default function ResumeUpload({ onSkillsExtracted }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setExtractedSkills([]);

    try {
      console.log('[ResumeUpload] Step 1: Extracting text from PDF...');
      const text = await extractTextFromPDF(file);
      console.log('[ResumeUpload] Step 2: Extracted text length:', text?.length, 'Preview:', text?.slice(0, 200));
      if (!text || text.trim().length < 20) throw new Error('PDF text too short or empty: ' + (text?.length || 0) + ' chars');
      console.log('[ResumeUpload] Step 3: Calling AI to extract skills...');
      const raw = await callAI(`Extract technical skills from this resume. Return ONLY a JSON array of skill strings, no markdown, nothing else. Example: ["Python", "React", "SQL"]
Resume: ${text.slice(0, 3000)}`);
      console.log('[ResumeUpload] Step 4: AI response:', raw);
      const clean = raw.replace(/```json|```/g, '').trim();
      const skills = JSON.parse(clean);
      console.log('[ResumeUpload] Step 5: Parsed skills:', skills);
      setExtractedSkills(skills);
    } catch (err) {
      console.error('[ResumeUpload] Error at step:', err);
      setError('Could not read resume. Please use manual skill entry below.');
    }
    setLoading(false);
  };

  const extractTextFromPDF = async (file) => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  return (
    <div className="resume-upload">
      <div className="upload-header">
        <h2>🎯 Let's personalize your matches</h2>
        <p>Upload your resume and AI will extract your skills automatically</p>
      </div>

      <label className="upload-box">
        <input type="file" accept=".pdf,.txt" onChange={handleFile} hidden />
        <div className="upload-icon">📄</div>
        <div className="upload-text">
          {fileName ? fileName : 'Click to upload your Resume'}
        </div>
        <div className="upload-sub">PDF or TXT • Max 5MB</div>
      </label>

      {loading && (
        <div className="upload-loading">
          <div className="spinner" />
          <p>AI is reading your resume...</p>
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}

      {extractedSkills.length > 0 && (
        <div className="skills-extracted">
          <p className="skills-label">✅ Skills extracted from your resume:</p>
          <div className="skills-row">
            {extractedSkills.map(skill => (
              <span className="skill-tag highlight" key={skill}>{skill}</span>
            ))}
          </div>
          <button className="start-btn" onClick={() => onSkillsExtracted(extractedSkills)}>
            Start Swiping Jobs →
          </button>
        </div>
      )}

      <div className="divider-row">
        <span className="divider-line" />
        <span className="divider-text">or enter skills manually</span>
        <span className="divider-line" />
      </div>

      <ManualSkills onSkillsExtracted={onSkillsExtracted} />
    </div>
  );
}