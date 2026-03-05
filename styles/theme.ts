'use client'

import { createTheme } from '@mui/material'

const theme = createTheme({
  typography: {
    fontFamily: '"Rubik", "Helvetica Neue", sans-serif',
    fontWeightRegular: 400,
    fontWeightBold: 500,
    subtitle1: {
      fontSize: '.8rem',
      color: '#616161',
    },
  },
  palette: {
    common: {
      black: '#000000',
      white: '#ffffff',
    },
    primary: {
      main: '#2f5283',
      light: '#e6eaf3',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
})

theme.extraColors = {
  grey: {
    main: '#616161',
    light: '#fafafa',
    dark: '#3e3e40',
  },
}

export default theme
