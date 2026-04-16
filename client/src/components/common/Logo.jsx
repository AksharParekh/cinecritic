import React from 'react';
import { Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

const Logo = () => {
  const theme = useTheme();

  return (
    <Typography
      variant="h6"
      fontWeight={800}
      fontSize="1.7rem"
      letterSpacing="0.2px"
      sx={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}
    >
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ color: theme.palette.primary.main }}>CineCritic</span>
      </Link>
    </Typography>
  );
};

export default Logo;
