import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Styled components for the Button
const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-default);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  /* Size variants */
  ${props => props.size === 'sm' && css`
    font-size: var(--font-size-xs);
    padding: 6px 12px;
    height: 32px;
  `}
  
  ${props => props.size === 'md' || !props.size ? css`
    font-size: var(--font-size-sm);
    padding: 8px 16px;
    height: 40px;
  `}
  
  ${props => props.size === 'lg' && css`
    font-size: var(--font-size-md);
    padding: 12px 24px;
    height: 48px;
  `}
  
  /* Width */
  width: ${props => props.isFullWidth ? '100%' : 'auto'};
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  /* Style variants */
  ${props => props.variant === 'primary' && css`
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(109, 90, 255, 0.2);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}
  
  ${props => props.variant === 'secondary' && css`
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    
    &:hover:not(:disabled) {
      background: rgba(109, 90, 255, 0.05);
    }
    
    &:active:not(:disabled) {
      background: rgba(109, 90, 255, 0.1);
    }
  `}
  
  ${props => props.variant === 'tertiary' && css`
    background: var(--card-background);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    
    &:hover:not(:disabled) {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  `}
  
  ${props => props.variant === 'ghost' && css`
    background: transparent;
    color: var(--text-color);
    border: none;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
    
    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
  
  ${props => props.variant === 'danger' && css`
    background: var(--error-color);
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
      background: #d32f2f;
      transform: translateY(-2px);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `}
  
  /* Loading state */
  ${props => props.isLoading && css`
    color: transparent !important;
    pointer-events: none;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-radius: 50%;
      border-top-color: currentColor;
      border-right-color: currentColor;
      animation: spin 0.7s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

// Button component with forwardRef
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isFullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        isFullWidth={isFullWidth}
        isLoading={isLoading}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {leftIcon && !isLoading ? leftIcon : null}
        {children}
        {rightIcon && !isLoading ? rightIcon : null}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button; 