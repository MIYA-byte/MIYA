import { createGlobalStyle } from 'styled-components';
import { generateCssVariables, Theme } from './theme';

interface GlobalStyleProps {
  theme: Theme;
}

const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
  /* Use theme variables */
  :root {
    ${({ theme }) => generateCssVariables(theme)}
  }

  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color var(--transition-default), color var(--transition-default);
  }

  #root {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: var(--spacing-md);
    font-weight: 600;
    line-height: 1.2;
  }

  h1 {
    font-size: var(--font-size-xxl);
  }

  h2 {
    font-size: var(--font-size-xl);
  }

  h3 {
    font-size: var(--font-size-lg);
  }

  h4 {
    font-size: var(--font-size-md);
  }

  p {
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-fast);

    &:hover {
      color: var(--text-accent);
      text-decoration: underline;
    }
  }

  button, input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  img, svg {
    display: block;
    max-width: 100%;
  }

  ul, ol {
    list-style-position: inside;
    margin-bottom: var(--spacing-md);
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    background-color: var(--card-background);
    padding: 2px 4px;
    border-radius: var(--border-radius-sm);
    font-size: 0.9em;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-color);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--text-muted);
    border-radius: var(--border-radius-pill);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* Utility classes */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }
`;

export default GlobalStyles; 