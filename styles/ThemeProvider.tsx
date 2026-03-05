'use client'

import React from 'react'
import { ThemeProvider as BaseProvider } from '@mui/material/styles'

import theme from './theme'
import GlobalStyle from './GlobalStyle'

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseProvider theme={theme}>
      <GlobalStyle />
      {children}
    </BaseProvider>
  )
}

export default ThemeProvider
