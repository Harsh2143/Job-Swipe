import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAeDmzfWjhScxIhmhXp_YPEIVYbImkM2UY');

export async function getMatchScore(job, userSkills) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a job matching assistant.
Candidate skills: ${userSkills.join(', ')}
Job Details:
- Role: ${job.role}
- Company: ${job.company}
- Required Skills: ${job.skills.join(', ')}
- Domain: ${job.domain}
- Description: ${job.description}

Give a match score out of 100 and one short reason (max 15 words).
Reply in this exact JSON format only, nothing else, no markdown:
{"score": 85, "reason": "Strong React and JavaScript skills match this role well"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('AI Match error:', err);
    return { score: 70, reason: "Could not load AI score right now" };
  }
}