import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { CloudUpload, CheckCircle, PersonOutline } from '@mui/icons-material';

interface AnalysisResult {
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

const ResumeUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('resume', file);

      // Upload resume
      const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/resume/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Check if we have the expected data structure
      if (!uploadResult.data || !uploadResult.data.id) {
        throw new Error('Invalid response from server: ' + JSON.stringify(uploadResult));
      }

      // Get analysis
      const analysisResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/analysis/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeId: uploadResult.data.id,
          resumeText: `Sample resume text with skills: ${uploadResult.data.extractedSkills.join(', ')}. Experience level: ${uploadResult.data.experienceLevel}`,
          jobDescriptions: [
            {
              id: 'job1',
              title: 'Software Engineer',
              skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
            },
            {
              id: 'job2', 
              title: 'Full Stack Developer',
              skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
            },
            {
              id: 'job3',
              title: 'Frontend Developer',
              skills: ['React', 'Vue.js', 'HTML', 'CSS', 'TypeScript', 'Redux'],
            }
          ],
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error(`Analysis failed: ${analysisResponse.statusText}`);
      }

      const analysis = await analysisResponse.json();
      console.log('Analysis result:', analysis);
      
      // Validate analysis result
      if (!analysis || typeof analysis !== 'object') {
        throw new Error('Invalid analysis response: ' + JSON.stringify(analysis));
      }
      
      // Backend returns data in { success, message, data } structure
      const analysisData = analysis.data || analysis;
      console.log('Analysis data for frontend:', analysisData);
      
      setAnalysisResult(analysisData);
      setSuccess(true);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Upload Your Resume
      </Typography>
      
      {!success && (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            border: '2px dashed #ccc',
            '&:hover': { borderColor: 'primary.main' }
          }}
        >
          <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Choose your resume file
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Supported formats: PDF, DOCX
          </Typography>
          
          <input
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            id="resume-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="resume-upload">
            <Button
              variant="contained"
              component="span"
              size="large"
              disabled={uploading}
            >
              Select File
            </Button>
          </label>
          
          {uploading && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                Processing your resume with AI...
              </Typography>
              <LinearProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>
      )}
      
      {success && analysisResult && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle />
              Resume analyzed successfully with AI!
            </Box>
          </Alert>

          {/* Experience Level */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <PersonOutline color="primary" />
                <Typography variant="h6">Experience Level</Typography>
              </Box>
              <Chip 
                label={analysisResult.experienceLevel ? analysisResult.experienceLevel.toUpperCase() : 'UNKNOWN'}
                color={
                  analysisResult.experienceLevel === 'professional' ? 'success' :
                  analysisResult.experienceLevel === 'intermediate' ? 'warning' : 'info'
                }
                size="medium"
              />
            </CardContent>
          </Card>

          {/* Extracted Skills */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Extracted Skills ({analysisResult.extractedSkills?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(analysisResult.extractedSkills || []).map((skill, index) => (
                  <Chip key={index} label={skill} color="primary" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Job Matches */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            🎯 Job Match Analysis
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(analysisResult.jobMatches || []).map((job, index) => (
              <Card key={index}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Job {index + 1}
                    </Typography>
                    <Chip 
                      label={`${job.fitScore || 0}% Match`}
                      color={(job.fitScore || 0) >= 75 ? 'success' : (job.fitScore || 0) >= 50 ? 'warning' : 'error'}
                      size="medium"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {job.reasoning || 'No reasoning provided'}
                  </Typography>

                  {(job.matchedSkills?.length || 0) > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        ✅ Matched Skills ({job.matchedSkills?.length || 0})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(job.matchedSkills || []).map((skill, skillIndex) => (
                          <Chip key={skillIndex} label={skill} color="success" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {(job.missingSkills?.length || 0) > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        ❌ Missing Skills ({job.missingSkills?.length || 0})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(job.missingSkills || []).map((skill, skillIndex) => (
                          <Chip key={skillIndex} label={skill} color="error" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Skill Gap Analysis */}
          {(analysisResult.skillGap?.length || 0) > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Skills to Improve Your Job Prospects
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(analysisResult.skillGap || []).map((skill, index) => (
                    <Chip key={index} label={skill} color="warning" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          {(analysisResult.recommendations?.length || 0) > 0 && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🤖 AI Career Recommendations
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  {(analysisResult.recommendations || []).map((recommendation, index) => (
                    <Typography key={index} component="li" variant="body2" sx={{ mb: 1 }}>
                      {recommendation}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          <Button 
            variant="outlined" 
            onClick={() => { setSuccess(false); setAnalysisResult(null); }}
            sx={{ mt: 3 }}
          >
            Upload Another Resume
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ResumeUpload;