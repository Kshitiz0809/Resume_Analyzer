import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import { Work, LocationOn, AttachMoney } from '@mui/icons-material';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  fitScore: number;
  salary?: string;
  skills: string[];
  experienceLevel: string;
}

const JobMatches: React.FC = () => {
  // Mock data - in real app, this would come from API
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      fitScore: 85,
      salary: '$80,000 - $120,000',
      skills: ['React', 'JavaScript', 'TypeScript'],
      experienceLevel: 'Intermediate'
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'Remote',
      fitScore: 78,
      salary: '$70,000 - $110,000',
      skills: ['Node.js', 'React', 'MongoDB'],
      experienceLevel: 'Intermediate'
    }
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Job Matches
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Jobs matched to your resume with AI-calculated fit scores
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {mockJobs.map((job) => (
          <Card key={job.id} sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Work color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  {job.title}
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                {job.company}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">{job.location}</Typography>
              </Box>
              
              {job.salary && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{job.salary}</Typography>
                </Box>
              )}
              
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" gutterBottom>
                  AI Fit Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress
                    variant="determinate"
                    value={job.fitScore}
                    sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
                    color={job.fitScore >= 80 ? 'success' : job.fitScore >= 60 ? 'warning' : 'error'}
                  />
                  <Typography variant="h6" color="primary">
                    {job.fitScore}%
                  </Typography>
                </Box>
              </Paper>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Required Skills:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              
              <Chip
                label={job.experienceLevel}
                color="primary"
                variant="outlined"
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default JobMatches;
