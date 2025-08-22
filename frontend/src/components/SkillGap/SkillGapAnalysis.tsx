import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, TrendingUp } from '@mui/icons-material';

interface Skill {
  name: string;
  hasSkill: boolean;
  demand: 'high' | 'medium' | 'low';
  category: string;
}

const SkillGapAnalysis: React.FC = () => {
  // Mock data - in real app, this would come from API
  const mockSkills: Skill[] = [
    { name: 'React', hasSkill: true, demand: 'high', category: 'Frontend' },
    { name: 'JavaScript', hasSkill: true, demand: 'high', category: 'Programming' },
    { name: 'Node.js', hasSkill: false, demand: 'high', category: 'Backend' },
    { name: 'Docker', hasSkill: false, demand: 'high', category: 'DevOps' },
    { name: 'TypeScript', hasSkill: true, demand: 'medium', category: 'Programming' },
    { name: 'AWS', hasSkill: false, demand: 'high', category: 'Cloud' },
  ];

  const hasSkills = mockSkills.filter(skill => skill.hasSkill);
  const missingSkills = mockSkills.filter(skill => !skill.hasSkill);

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Skill Gap Analysis
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Analysis of your current skills and recommendations for improvement
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 400px', minWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Skills You Have ({hasSkills.length})
              </Typography>
            </Box>
            
            <List>
              {hasSkills.map((skill, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={skill.name}
                    secondary={skill.category}
                  />
                  <Chip
                    label={skill.demand}
                    size="small"
                    color={getDemandColor(skill.demand) as any}
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 400px', minWidth: 400 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Skills to Learn ({missingSkills.length})
              </Typography>
            </Box>
            
            <List>
              {missingSkills.map((skill, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <RadioButtonUnchecked color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={skill.name}
                    secondary={skill.category}
                  />
                  <Chip
                    label={skill.demand}
                    size="small"
                    color={getDemandColor(skill.demand) as any}
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          💡 Recommendations
        </Typography>
        <Typography variant="body1">
          Focus on learning high-demand skills like <strong>Node.js</strong>, <strong>Docker</strong>, and <strong>AWS</strong> to significantly improve your job prospects. 
          These skills are currently in high demand and will make you more competitive for full-stack and backend positions.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SkillGapAnalysis;
