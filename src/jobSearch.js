const RAPIDAPI_KEY = '25aa45d1c3msh9e305d88ccfa254p1f1027jsnec5e397c7693';

export async function fetchJobs(skills, page = 1) {
  const query = skills.slice(0, 3).join(' ') + ' developer';

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1&page=${page}&date_posted=month`,
    {
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`JSearch API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.data || result.data.length === 0) {
    return [];
  }

  return result.data.map((job, index) => ({
    id: job.job_id || `job-${page}-${index}`,
    role: job.job_title || 'Untitled Role',
    company: job.employer_name || 'Unknown Company',
    location: [job.job_city, job.job_state, job.job_country]
      .filter(Boolean)
      .join(', ') || 'Remote',
    stipend: job.job_min_salary && job.job_max_salary
      ? `$${Math.round(job.job_min_salary).toLocaleString()} - $${Math.round(job.job_max_salary).toLocaleString()}`
      : job.job_salary_period
        ? `${job.job_salary_period} salary`
        : 'Salary not disclosed',
    skills: extractSkillsFromJob(job),
    domain: job.job_employment_type || 'Full-time',
    description: job.job_description
      ? job.job_description.slice(0, 300) + (job.job_description.length > 300 ? '...' : '')
      : 'No description available.',
    applyLink: job.job_apply_link || null,
    employerLogo: job.employer_logo || null,
    postedAt: job.job_posted_at_datetime_utc || null,
    isRemote: job.job_is_remote || false
  }));
}

function extractSkillsFromJob(job) {
  const skills = [];

  // Try to get from highlights
  if (job.job_highlights?.Qualifications) {
    const qualText = job.job_highlights.Qualifications.join(' ');
    const techSkills = [
      'React', 'JavaScript', 'TypeScript', 'Python', 'Java', 'Node.js',
      'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CSS',
      'HTML', 'Angular', 'Vue', 'C++', 'C#', 'Go', 'Rust', 'Swift',
      'Kotlin', 'Flutter', 'Django', 'Flask', 'Spring', 'Express',
      'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'Linux', 'Azure',
      'GCP', 'TensorFlow', 'PyTorch', 'Figma', 'Tailwind', 'Next.js',
      'Firebase', 'Terraform', 'Jenkins', 'CI/CD', 'Agile', 'Scrum',
      'Machine Learning', 'Data Analysis', 'Excel', 'Tableau', 'Power BI'
    ];
    techSkills.forEach(skill => {
      if (qualText.toLowerCase().includes(skill.toLowerCase()) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });
  }

  // Fallback: extract from description
  if (skills.length === 0 && job.job_description) {
    const desc = job.job_description;
    const commonSkills = [
      'React', 'JavaScript', 'Python', 'Java', 'Node.js', 'SQL',
      'AWS', 'Docker', 'Git', 'CSS', 'HTML', 'TypeScript', 'MongoDB',
      'Angular', 'Vue', 'C++', 'Go', 'Kotlin', 'Swift', 'Django',
      'Express', 'PostgreSQL', 'GraphQL', 'Linux', 'Azure', 'GCP',
      'Figma', 'Next.js', 'Firebase', 'Machine Learning'
    ];
    commonSkills.forEach(skill => {
      if (desc.toLowerCase().includes(skill.toLowerCase()) && !skills.includes(skill)) {
        skills.push(skill);
      }
    });
  }

  return skills.length > 0 ? skills.slice(0, 6) : ['General Skills'];
}
