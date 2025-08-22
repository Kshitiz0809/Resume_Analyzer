import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  filename: string;
  originalText: string;
  extractedSkills: string[];
  experienceLevel: 'fresher' | 'intermediate' | 'professional';
  uploadedAt: Date;
  analyzedAt?: Date;
  analysis?: {
    fitScores: Array<{
      jobId: string;
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
    }>;
    skillGap: string[];
    recommendations: string[];
  };
}

const ResumeSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  originalText: { 
    type: String, 
    required: true 
  },
  extractedSkills: [{ 
    type: String 
  }],
  experienceLevel: { 
    type: String, 
    enum: ['fresher', 'intermediate', 'professional'],
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  analyzedAt: { 
    type: Date 
  },
  analysis: {
    fitScores: [{
      jobId: String,
      score: Number,
      matchedSkills: [String],
      missingSkills: [String]
    }],
    skillGap: [String],
    recommendations: [String]
  }
});

export default mongoose.model<IResume>('Resume', ResumeSchema);
