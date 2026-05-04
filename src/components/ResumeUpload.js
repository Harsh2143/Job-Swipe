import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAeDmzfWjhScxIhmhXp_YPEIVYbImkM2UY');

function ManualSkills({ onSkillsExtracted }) {
  const [input, setInput] = useState('');
  const [skills, setSkills] = useState([]);

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = input.trim().replace(',', '');
      if (skill && !skills.includes(skill)) {
        setSkills(prev => [...prev, skill]);
      }
      setInput('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="manual-skills">
      <input
        className="skill-input"
        type="text"
        placeholder="Type a skill and press Enter (e.g. Python)"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={addSkill}
      />
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
      const text = await extractTextFromPDF(file);
      if (!text || text.trim().length < 20) throw new Error('Too short');
      const skills = await extractSkillsWithAI(text);
      setExtractedSkills(skills);
    } catch (err) {
      console.error(err);
      setError('Could not read resume. Please use the manual skill entry below.');
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

  const extractSkillsWithAI = async (resumeText) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Extract technical skills from this resume. Return ONLY a JSON array of skill strings, no markdown, nothing else. Example: ["Python", "React", "SQL"]
Resume: ${resumeText.slice(0, 3000)}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
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