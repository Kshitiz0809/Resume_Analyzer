import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { createError } from '../middleware/errorHandler';
import { GeminiAnalysisService } from '../services/gemini.service';
import { DocumentParserService } from '../services/document-parser.service';
import Resume from '../models/Resume.model';

const router = Router();

// Initialize services
let geminiService: GeminiAnalysisService | null = null;
let documentParser: DocumentParserService | null = null;

const getGeminiService = () => {
  if (!geminiService) {
    geminiService = new GeminiAnalysisService();
  }
  return geminiService;
};

const getDocumentParser = () => {
  if (!documentParser) {
    documentParser = new DocumentParserService();
  }
  return documentParser;
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(createError('Only PDF and DOCX files are allowed', 400));
    }
  },
});

// POST /api/resumes/upload
router.post('/upload', upload.single('resume'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    console.log('📄 Processing file:', req.file.originalname);
    console.log('📁 File size:', req.file.size, 'bytes');
    console.log('🔍 MIME type:', req.file.mimetype);

    // Extract text from the uploaded file
    let resumeText: string;
    try {
      resumeText = await getDocumentParser().extractText(req.file.buffer, req.file.mimetype);
      console.log('✅ Extracted text length:', resumeText.length, 'characters');
      console.log('📝 Text preview:', resumeText.substring(0, 200) + '...');
    } catch (extractionError) {
      console.error('❌ Text extraction failed:', extractionError);
      return next(createError('Failed to extract text from file', 500));
    }

    // Use Gemini to analyze the resume
    const analysisResult = await getGeminiService().extractResumeText(resumeText);

    // Save to database
    const resume = new Resume({
      userId: 'default-user', // TODO: Implement user authentication
      filename: req.file.originalname,
      originalText: resumeText,
      extractedSkills: analysisResult.skills,
      experienceLevel: analysisResult.experienceLevel,
      uploadedAt: new Date(),
      analyzedAt: new Date(),
    });

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        id: resume._id,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        extractedSkills: analysisResult.skills,
        experienceLevel: analysisResult.experienceLevel,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    next(error);
  }
});

// GET /api/resumes/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const resume = await Resume.findById(id);
    if (!resume) {
      return next(createError('Resume not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Resume retrieved successfully',
      data: {
        id: resume._id,
        filename: resume.filename,
        experienceLevel: resume.experienceLevel,
        extractedSkills: resume.extractedSkills,
        analysis: resume.analysis,
        uploadedAt: resume.uploadedAt,
        analyzedAt: resume.analyzedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/resumes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const resumes = await Resume.find({ userId: 'default-user' }) // TODO: Use actual user ID
      .sort({ uploadedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Resume.countDocuments({ userId: 'default-user' });

    res.status(200).json({
      success: true,
      message: 'Resumes retrieved successfully',
      data: {
        resumes: resumes.map(resume => ({
          id: resume._id,
          filename: resume.filename,
          experienceLevel: resume.experienceLevel,
          extractedSkills: resume.extractedSkills,
          uploadedAt: resume.uploadedAt,
          analyzedAt: resume.analyzedAt,
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
