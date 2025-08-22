import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  CardActions,
  Container 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  CloudUpload, 
  Work, 
  TrendingUp, 
  Psychology,
  Assessment,
  FindReplace 
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Smart Resume Analysis',
      description: 'Upload your resume and get AI-powered insights about your experience level and skills.',
      icon: <Psychology fontSize="large" color="primary" />,
      action: () => navigate('/upload'),
      buttonText: 'Upload Resume'
    },
    {
      title: 'Job Matching',
      description: 'Find jobs that match your skills with AI-calculated fit scores.',
      icon: <Work fontSize="large" color="primary" />,
      action: () => navigate('/matches'),
      buttonText: 'View Matches'
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Discover missing skills and get recommendations to improve your job prospects.',
      icon: <TrendingUp fontSize="large" color="primary" />,
      action: () => navigate('/skills'),
      buttonText: 'Analyze Skills'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          AI-Powered Resume Uploader
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Transform your job search with intelligent resume analysis and personalized recommendations
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 6, justifyContent: 'center' }}>
        {features.map((feature, index) => (
          <Card 
            key={index}
            sx={{ 
              width: 350,
              height: 300,
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {feature.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button 
                variant="contained" 
                onClick={feature.action}
                size="large"
              >
                {feature.buttonText}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 4, 
        borderRadius: 2,
        textAlign: 'center',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom color="primary">
          How It Works
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2, justifyContent: 'center' }}>
          <Box sx={{ width: 300, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <CloudUpload fontSize="large" color="secondary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              1. Upload Resume
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upload your PDF or DOCX resume for intelligent text extraction and analysis
            </Typography>
          </Box>
          <Box sx={{ width: 300, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <Assessment fontSize="large" color="secondary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              2. AI Analysis
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Our AI analyzes your resume against job requirements and classifies your experience level
            </Typography>
          </Box>
          <Box sx={{ width: 300, textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              <FindReplace fontSize="large" color="secondary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              3. Get Insights
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Receive job matches, skill gap analysis, and personalized improvement recommendations
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
