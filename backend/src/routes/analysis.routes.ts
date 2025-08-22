import { Router, Request, Response, NextFunction } from 'express';
import { GeminiAnalysisService } from '../services/gemini.service';
import Resume from '../models/Resume.model';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Initialize Gemini service
// Initialize the service lazily
let geminiService: GeminiAnalysisService | null = null;
const getGeminiService = () => {
  if (!geminiService) {
    geminiService = new GeminiAnalysisService();
  }
  return geminiService;
};

// POST /api/analysis/resume
router.post('/resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resumeId, jobIds } = req.body;

    console.log('🔍 Analysis request for resume ID:', resumeId);

    if (!resumeId) {
      return next(createError('Resume ID is required', 400));
    }

    // Fetch resume from database
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return next(createError('Resume not found', 404));
    }

    console.log('📄 Found resume:', resume.filename);
    console.log('📝 Resume text length:', resume.originalText.length);
    console.log('🎯 Existing extracted skills:', resume.extractedSkills);

    // Mock job descriptions (in production, fetch from job API or database)
    const mockJobs = [
      {
        id: '1',
        title: 'Frontend Developer',
        description: 'We are looking for a skilled frontend developer to join our team.',
        requirements: ['3+ years of React experience', 'JavaScript proficiency', 'HTML/CSS skills'],
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux', 'TypeScript'],
      },
      {
        id: '2',
        title: 'Full Stack Developer',
        description: 'Join our fast-growing startup as a full stack developer.',
        requirements: ['2+ years of Node.js experience', 'Database design', 'API development'],
        skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript'],
      },
      {
        id: '3',
        title: 'Embedded Systems Engineer',
        description: 'Work on IoT and embedded systems projects.',
        requirements: ['Arduino/Microcontroller experience', 'C/C++ programming', 'Electronics knowledge'],
        skills: ['Arduino', 'C++', 'Electronics', 'Microcontrollers', 'Sensors', 'IoT'],
      },
    ];

    // Use Gemini AI to analyze resume against jobs
    const analysisRequest = {
      resumeText: resume.originalText,
      jobDescriptions: mockJobs,
    };

    console.log('🤖 Sending analysis request to Gemini...');
    const analysisResult = await getGeminiService().analyzeResume(analysisRequest);
    console.log('✅ Analysis completed:', {
      experienceLevel: analysisResult.experienceLevel,
      skillsCount: analysisResult.extractedSkills.length,
      jobMatchesCount: analysisResult.jobMatches.length
    });

    // Update resume with analysis results
    resume.analysis = {
      fitScores: analysisResult.jobMatches.map(match => ({
        jobId: match.jobId,
        score: match.fitScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
      })),
      skillGap: analysisResult.skillGap,
      recommendations: analysisResult.recommendations,
    };
    resume.analyzedAt = new Date();
    await resume.save();

    const response = {
      experienceLevel: analysisResult.experienceLevel,
      extractedSkills: analysisResult.extractedSkills, // Frontend expects this key
      skillsAnalysis: {
        hasSkills: analysisResult.extractedSkills,
        missingSkills: analysisResult.skillGap,
        skillGap: analysisResult.skillGap.length,
      },
      jobMatches: analysisResult.jobMatches.map(match => ({
        jobId: match.jobId,
        fitScore: match.fitScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        reasoning: match.reasoning, // Changed from recommendation to reasoning
      })),
      skillGap: analysisResult.skillGap, // Frontend expects this key
      recommendations: analysisResult.recommendations,
    };

    console.log('📊 Final analysis response:', {
      experienceLevel: response.experienceLevel,
      extractedSkillsCount: response.extractedSkills.length,
      jobMatchesCount: response.jobMatches.length,
      skillGapCount: response.skillGap.length
    });

    res.status(200).json({
      success: true,
      message: 'Resume analysis completed',
      data: response,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    next(error);
  }
});

// GET /api/analysis/skills
router.get('/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Integrate with MCP server to get skills dataset
    
    // Mock skills data with realistic tech skills
    const skillsData = [
      { name: 'JavaScript', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'React', category: 'Frontend', level: 'intermediate', demand: 'high' },
      { name: 'Node.js', category: 'Backend', level: 'intermediate', demand: 'high' },
      { name: 'Python', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'TypeScript', category: 'Programming', level: 'intermediate', demand: 'high' },
      { name: 'Express.js', category: 'Backend', level: 'intermediate', demand: 'medium' },
      { name: 'MongoDB', category: 'Database', level: 'intermediate', demand: 'medium' },
      { name: 'PostgreSQL', category: 'Database', level: 'intermediate', demand: 'high' },
      { name: 'Docker', category: 'DevOps', level: 'intermediate', demand: 'high' },
      { name: 'Kubernetes', category: 'DevOps', level: 'senior', demand: 'high' },
      { name: 'AWS', category: 'Cloud', level: 'intermediate', demand: 'high' },
      { name: 'Azure', category: 'Cloud', level: 'intermediate', demand: 'medium' },
      { name: 'Git', category: 'Tools', level: 'entry', demand: 'high' },
      { name: 'Jenkins', category: 'DevOps', level: 'intermediate', demand: 'medium' },
      { name: 'Redis', category: 'Database', level: 'intermediate', demand: 'medium' },
      { name: 'GraphQL', category: 'Backend', level: 'intermediate', demand: 'medium' },
      { name: 'Vue.js', category: 'Frontend', level: 'intermediate', demand: 'medium' },
      { name: 'Angular', category: 'Frontend', level: 'intermediate', demand: 'medium' },
      { name: 'Java', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'Spring Boot', category: 'Backend', level: 'intermediate', demand: 'medium' },
    ];

    res.status(200).json({
      success: true,
      message: 'Skills data retrieved successfully',
      data: {
        skills: skillsData,
        categories: ['Programming', 'Frontend', 'Backend', 'Database', 'DevOps', 'Cloud', 'Tools'],
        levels: ['entry', 'intermediate', 'senior'],
        totalSkills: skillsData.length,
        highDemandSkills: skillsData.filter(skill => skill.demand === 'high').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/analysis/resume/:id/skills
router.get('/resume/:id/skills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const resume = await Resume.findById(id);
    if (!resume) {
      return next(createError('Resume not found', 404));
    }

    // Get skills analysis for this specific resume
    const allSkills = [
      { name: 'JavaScript', category: 'Programming', level: 'entry', demand: 'high' },
      { name: 'React', category: 'Frontend', level: 'intermediate', demand: 'high' },
      { name: 'Node.js', category: 'Backend', level: 'intermediate', demand: 'high' },
      { name: 'MongoDB', category: 'Database', level: 'intermediate', demand: 'medium' },
      { name: 'Docker', category: 'DevOps', level: 'intermediate', demand: 'high' },
      { name: 'AWS', category: 'Cloud', level: 'intermediate', demand: 'high' },
      { name: 'TypeScript', category: 'Programming', level: 'intermediate', demand: 'high' },
      { name: 'Express.js', category: 'Backend', level: 'intermediate', demand: 'medium' },
    ];

    const hasSkills = allSkills.filter(skill => 
      resume.extractedSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.name.toLowerCase())
      )
    );

    const missingSkills = allSkills.filter(skill => 
      !resume.extractedSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(skill.name.toLowerCase())
      )
    );

    res.status(200).json({
      success: true,
      message: 'Resume skill analysis completed',
      data: {
        resumeId: id,
        hasSkills,
        missingSkills,
        skillGapCount: missingSkills.length,
        completeness: (hasSkills.length / allSkills.length) * 100,
        recommendations: resume.analysis?.recommendations || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
