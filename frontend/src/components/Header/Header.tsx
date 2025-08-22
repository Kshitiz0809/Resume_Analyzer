import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CloudUpload, Work, TrendingUp } from '@mui/icons-material';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          🤖 AI Resume Analyzer
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            startIcon={<CloudUpload />}
            onClick={() => navigate('/upload')}
          >
            Upload Resume
          </Button>
          <Button 
            color="inherit" 
            startIcon={<Work />}
            onClick={() => navigate('/matches')}
          >
            Job Matches
          </Button>
          <Button 
            color="inherit" 
            startIcon={<TrendingUp />}
            onClick={() => navigate('/skills')}
          >
            Skill Analysis
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
