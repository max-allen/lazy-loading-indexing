'use client'

import { Global, css } from '@emotion/react'

const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        font-family: 'Rubik', 'Helvetica Neue', sans-serif;
        background-color: #f5f7fc;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-weight: 500;
      }

      ul,
      ol {
        padding: 0;
        margin: 0;
        padding-left: 1.25em;
      }
    `}
  />
)

export default GlobalStyles
