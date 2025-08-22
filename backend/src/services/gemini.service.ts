import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ResumeAnalysisRequest {
  resumeText: string;
  jobDescriptions: Array<{
    id: string;
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
  }>;
}

export interface ResumeAnalysisResponse {
  experienceLevel: 'fresher' | 'intermediate' | 'professional';
  extractedSkills: string[];
  jobMatches: Array<{
    jobId: string;
    fitScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    reasoning: string;
  }>;
  skillGap: string[];
  recommendations: string[];
}

export class GeminiAnalysisService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 Debug: API Key exists:', !!apiKey);
    console.log('🔑 Debug: API Key length:', apiKey ? apiKey.length : 'N/A');
    
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.isConfigured = true;
        console.log('✅ Gemini API configured successfully');
      } catch (error) {
        console.warn('⚠️ Gemini API configuration failed:', error);
        console.warn('   Using mock responses instead');
        this.isConfigured = false;
      }
    } else {
      console.warn('⚠️ Gemini API key not provided, using mock responses');
      console.warn('   Add your API key to backend/.env to enable AI features');
      this.isConfigured = false;
    }
  }

  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResponse> {
    try {
      if (!this.isConfigured) {
        // Return mock response when API is not configured
        return this.getMockAnalysisResponse(request);
      }

      const prompt = this.buildAnalysisPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      return this.parseAnalysisResponse(text);
    } catch (error) {
      console.error('Error analyzing resume with Gemini:', error);
      console.warn('Falling back to mock response');
      return this.getMockAnalysisResponse(request);
    }
  }

  private buildAnalysisPrompt(request: ResumeAnalysisRequest): string {
    const jobsDescription = request.jobDescriptions
      .map(job => `
Job ID: ${job.id}
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements.join(', ')}
Skills: ${job.skills.join(', ')}
      `).join('\n---\n');

    return `
You are an AI resume analyzer. Analyze the following resume against the provided job descriptions and return a JSON response.

RESUME TEXT:
${request.resumeText}

JOB DESCRIPTIONS:
${jobsDescription}

Please analyze the resume and provide a JSON response with the following structure:
{
  "experienceLevel": "fresher|intermediate|professional",
  "extractedSkills": ["skill1", "skill2", ...],
  "jobMatches": [
    {
      "jobId": "job_id",
      "fitScore": 0-100,
      "matchedSkills": ["skill1", "skill2", ...],
      "missingSkills": ["skill1", "skill2", ...],
      "reasoning": "Brief explanation of the fit score"
    }
  ],
  "skillGap": ["missing_skill1", "missing_skill2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}

Guidelines:
1. Experience Level:
   - "fresher": 0-2 years of experience or recent graduate
   - "intermediate": 2-5 years of experience
   - "professional": 5+ years of experience

2. Fit Score Calculation:
   - 80-100: Excellent match, most requirements met
   - 60-79: Good match, some key requirements met
   - 40-59: Moderate match, basic requirements met
   - 0-39: Poor match, few requirements met

3. Extract all technical skills, programming languages, frameworks, tools, and relevant technologies mentioned in the resume.

4. For each job match, list skills that are present in both resume and job requirements as "matchedSkills", and required skills not found in resume as "missingSkills".

5. Skill gap should include the most important missing skills across all analyzed jobs.

6. Recommendations should be actionable advice for improving the candidate's profile.

Return only valid JSON, no additional text.
`;
  }

  private parseAnalysisResponse(responseText: string): ResumeAnalysisResponse {
    try {
      // Clean up the response text to extract JSON
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON found in response');
      }
      
      const jsonText = responseText.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonText);
      
      // Validate the response structure
      if (!parsed.experienceLevel || !Array.isArray(parsed.extractedSkills) || !Array.isArray(parsed.jobMatches)) {
        throw new Error('Invalid response structure');
      }
      
      return parsed as ResumeAnalysisResponse;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', responseText);
      
      // Return a fallback response
      return {
        experienceLevel: 'intermediate',
        extractedSkills: [],
        jobMatches: [],
        skillGap: [],
        recommendations: ['Unable to analyze resume at this time. Please try again.'],
      };
    }
  }

  async extractResumeText(resumeText: string): Promise<{ skills: string[]; experienceLevel: 'fresher' | 'intermediate' | 'professional' }> {
    try {
      if (!this.isConfigured) {
        console.log('⚠️  Gemini not configured, using mock response');
        return this.getMockExtractionResponse(resumeText);
      }

      console.log('🔍 Analyzing resume with Gemini...');
      console.log('📝 Resume text sample:', resumeText.substring(0, 500));

      const prompt = `
Analyze the following resume text and extract key information:

RESUME TEXT:
${resumeText}

Please provide a JSON response with:
{
  "skills": ["skill1", "skill2", ...],
  "experienceLevel": "fresher|intermediate|professional"
}

Guidelines:
- Extract all technical skills, programming languages, frameworks, tools, and technologies
- Determine experience level based on years of experience, job titles, and responsibility levels
- Return only valid JSON, no additional text
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Raw Gemini response:', text);
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        console.log('❌ No JSON found in Gemini response, using mock');
        return this.getMockExtractionResponse(resumeText);
      }
      
      const jsonText = text.substring(jsonStart, jsonEnd);
      console.log('📊 Extracted JSON:', jsonText);
      
      const parsed = JSON.parse(jsonText);
      console.log('✅ Parsed result:', parsed);
      
      return parsed;
    } catch (error) {
      console.error('❌ Error extracting resume information:', error);
      console.log('🔄 Falling back to mock response');
      return this.getMockExtractionResponse(resumeText);
    }
  }

  private getMockAnalysisResponse(request: ResumeAnalysisRequest): ResumeAnalysisResponse {
    // Generate a realistic mock response based on the input
    const extractedSkills = this.extractSkillsFromText(request.resumeText);
    const experienceLevel = this.determineExperienceLevel(request.resumeText);

    const jobMatches = request.jobDescriptions.map(job => {
      const matchedSkills = job.skills.filter(skill => 
        extractedSkills.some(resumeSkill => 
          resumeSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      const missingSkills = job.skills.filter(skill => 
        !extractedSkills.some(resumeSkill => 
          resumeSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

      const fitScore = Math.min(90, Math.max(40, 
        (matchedSkills.length / job.skills.length) * 100 + Math.random() * 10
      ));

      return {
        jobId: job.id,
        fitScore: Math.round(fitScore),
        matchedSkills,
        missingSkills,
        reasoning: `Based on your ${matchedSkills.length} matching skills out of ${job.skills.length} required, you have a ${fitScore > 75 ? 'strong' : fitScore > 50 ? 'good' : 'moderate'} fit for this role.`
      };
    });

    const allRequiredSkills = request.jobDescriptions.flatMap(job => job.skills);
    const skillGap = [...new Set(allRequiredSkills)].filter(skill => 
      !extractedSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    return {
      experienceLevel,
      extractedSkills,
      jobMatches,
      skillGap,
      recommendations: this.generateRecommendations(skillGap, experienceLevel)
    };
  }

  private getMockExtractionResponse(resumeText: string): { skills: string[]; experienceLevel: 'fresher' | 'intermediate' | 'professional' } {
    console.log('🔄 Generating mock response from resume text');
    const extractedSkills = this.extractSkillsFromText(resumeText);
    const experienceLevel = this.determineExperienceLevel(resumeText);
    
    console.log('🎯 Mock extracted skills:', extractedSkills);
    console.log('📊 Mock experience level:', experienceLevel);
    
    return {
      skills: extractedSkills,
      experienceLevel
    };
  }

  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'C', 'Perl', 'Shell', 'Bash',
      
      // Web Technologies
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
      'HTML', 'CSS', 'SCSS', 'SASS', 'Bootstrap', 'Tailwind', 'jQuery', 'Webpack',
      'Next.js', 'Nuxt.js', 'Gatsby', 'Redux', 'MobX', 'Vuex',
      
      // Databases
      'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Elasticsearch', 'Oracle',
      'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase', 'SQL',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
      'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible', 'Chef', 'Puppet',
      
      // Mobile Development
      'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
      
      // Tools & Others
      'Git', 'SVN', 'Mercurial', 'Jira', 'Confluence', 'Slack', 'Teams',
      'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum', 'Kanban',
      'TDD', 'BDD', 'CI/CD', 'DevOps', 'Linux', 'Ubuntu', 'Windows', 'macOS',
      
      // Data & Analytics
      'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Scikit-learn', 'TensorFlow',
      'PyTorch', 'Keras', 'OpenCV', 'Tableau', 'Power BI', 'Excel',
      
      // Engineering & Electronics (based on your solar tracking project)
      'Arduino', 'Raspberry Pi', 'IoT', 'Sensors', 'Automation', 'Control Systems',
      'Solar Energy', 'Renewable Energy', 'Electronics', 'Circuit Design',
      'Embedded Systems', 'Microcontrollers', 'PCB Design', 'MATLAB Simulink'
    ];

    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );

    // Look for additional patterns
    const additionalSkills: string[] = [];
    
    // Look for programming language patterns
    const programmingPatterns = [
      /\b(programming|coding|development)\s+in\s+(\w+)/gi,
      /\b(\w+)\s+(programming|development|coding)/gi,
      /\bexperience\s+with\s+(\w+)/gi,
      /\bproficient\s+in\s+(\w+)/gi,
      /\bknowledge\s+of\s+(\w+)/gi,
    ];

    programmingPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 2 && match[1].length < 20) {
          additionalSkills.push(match[1]);
        }
        if (match[2] && match[2].length > 2 && match[2].length < 20) {
          additionalSkills.push(match[2]);
        }
      }
    });

    const allSkills = [...foundSkills, ...additionalSkills];
    const uniqueSkills = [...new Set(allSkills)];
    
    console.log('🔍 Skills found in text:', uniqueSkills);
    return uniqueSkills;
  }

  private determineExperienceLevel(text: string): 'fresher' | 'intermediate' | 'professional' {
    const lowerText = text.toLowerCase();
    
    // Look for explicit year mentions
    const yearPatterns = [
      /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi,
      /(\d+)\+?\s*yrs?\s*(of\s*)?(experience|exp)/gi,
      /(experience|exp).{0,20}(\d+)\+?\s*years?/gi,
      /(experience|exp).{0,20}(\d+)\+?\s*yrs?/gi,
    ];

    let maxYears = 0;
    yearPatterns.forEach(pattern => {
      const matches = lowerText.matchAll(pattern);
      for (const match of matches) {
        const years = parseInt(match[1] || match[2]);
        if (!isNaN(years) && years > maxYears) {
          maxYears = years;
        }
      }
    });

    // Look for seniority indicators
    const professionalKeywords = [
      'senior', 'lead', 'manager', 'director', 'head of', 'chief', 'principal',
      'architect', 'consultant', 'expert', 'specialist', 'team lead'
    ];
    
    const intermediateKeywords = [
      'developer', 'engineer', 'analyst', 'associate', 'coordinator',
      'experience', 'worked on', 'developed', 'implemented', 'designed'
    ];
    
    const fresherKeywords = [
      'fresher', 'graduate', 'entry level', 'recent graduate', 'new graduate',
      'intern', 'trainee', 'beginner', 'student', 'looking for opportunities'
    ];

    const hasProfessionalKeywords = professionalKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    const hasIntermediateKeywords = intermediateKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    const hasFresherKeywords = fresherKeywords.some(keyword => 
      lowerText.includes(keyword)
    );

    console.log('📊 Experience analysis:');
    console.log('   Max years found:', maxYears);
    console.log('   Professional keywords:', hasProfessionalKeywords);
    console.log('   Intermediate keywords:', hasIntermediateKeywords);
    console.log('   Fresher keywords:', hasFresherKeywords);

    // Determine experience level based on years and keywords
    if (maxYears >= 5 || hasProfessionalKeywords) {
      console.log('   → Classified as: Professional');
      return 'professional';
    } else if (maxYears >= 2 || (hasIntermediateKeywords && !hasFresherKeywords)) {
      console.log('   → Classified as: Intermediate');
      return 'intermediate';
    } else {
      console.log('   → Classified as: Fresher');
      return 'fresher';
    }
  }

  private generateRecommendations(skillGap: string[], experienceLevel: string): string[] {
    const recommendations = [];

    if (skillGap.includes('Docker')) {
      recommendations.push('Learn Docker for containerization to improve DevOps skills');
    }
    if (skillGap.includes('AWS')) {
      recommendations.push('Get AWS certification to boost cloud computing expertise');
    }
    if (skillGap.includes('TypeScript')) {
      recommendations.push('Learn TypeScript to write more robust JavaScript applications');
    }
    if (skillGap.includes('Node.js')) {
      recommendations.push('Master Node.js for full-stack development opportunities');
    }

    if (experienceLevel === 'fresher') {
      recommendations.push('Focus on building a strong portfolio with personal projects');
      recommendations.push('Contribute to open-source projects to gain experience');
    } else if (experienceLevel === 'intermediate') {
      recommendations.push('Consider learning system design and architecture patterns');
      recommendations.push('Develop leadership and mentoring skills');
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  }
}
