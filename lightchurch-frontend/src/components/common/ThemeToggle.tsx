import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useColorMode } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { toggleTheme } = useColorMode();

  return (
    <Tooltip title={theme.palette.mode === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit"
        sx={{
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(45deg)',
          },
        }}
      >
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
