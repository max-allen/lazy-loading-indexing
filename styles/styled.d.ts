import '@mui/material/styles'
import { SimplePaletteColorOptions } from '@mui/material/styles'
declare module '@mui/material/styles' {
  export interface Theme {
    extraColors: {
      grey: SimplePaletteColorOptions
    }
  }
}
