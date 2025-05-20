import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isFullWidth?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}

const InputContainer = styled.div<{ isFullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);
  width: ${props => props.isFullWidth ? '100%' : 'auto'};
`;

const InputLabel = styled.label`
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{
  hasError?: boolean;
  hasIcon?: boolean;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  font-family: inherit;
  color: var(--text-primary);
  background-color: var(--input-background);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-default);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(109, 90, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  /* Size variants */
  ${props => props.size === 'sm' && css`
    font-size: var(--font-size-xs);
    padding: 6px 12px;
    height: 32px;
  `}
  
  ${props => !props.size || props.size === 'md' ? css`
    font-size: var(--font-size-sm);
    padding: 8px 16px;
    height: 40px;
  ` : ''}
  
  ${props => props.size === 'lg' && css`
    font-size: var(--font-size-md);
    padding: 12px 24px;
    height: 48px;
  `}
  
  /* Icon padding adjustments */
  ${props => props.hasIcon && props.iconPosition === 'left' && css`
    padding-left: ${props.size === 'sm' ? '32px' : props.size === 'lg' ? '48px' : '40px'};
  `}
  
  ${props => props.hasIcon && props.iconPosition === 'right' && css`
    padding-right: ${props.size === 'sm' ? '32px' : props.size === 'lg' ? '48px' : '40px'};
  `}
  
  /* Variant styles */
  ${props => props.variant === 'filled' && css`
    border: none;
    background-color: var(--card-background);
    
    &:focus {
      background-color: var(--input-background);
    }
  `}
  
  ${props => props.variant === 'outlined' && css`
    background-color: transparent;
    border: 1px solid var(--border-color);
    
    &:focus {
      background-color: var(--input-background);
    }
  `}
  
  /* Error state */
  ${props => props.hasError && css`
    border-color: var(--error-color);
    
    &:focus {
      box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
    }
  `}
`;

const IconContainer = styled.div<{ position: 'left' | 'right'; size?: 'sm' | 'md' | 'lg' }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  ${props => props.position === 'left' && css`
    left: ${props.size === 'sm' ? '8px' : props.size === 'lg' ? '16px' : '12px'};
  `}
  
  ${props => props.position === 'right' && css`
    right: ${props.size === 'sm' ? '8px' : props.size === 'lg' ? '16px' : '12px'};
  `}
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
`;

const HintText = styled.div`
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      isFullWidth = false,
      variant = 'default',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <InputContainer isFullWidth={isFullWidth} className={className}>
        {label && <InputLabel>{label}</InputLabel>}
        <InputWrapper>
          {icon && (
            <IconContainer position={iconPosition} size={size}>
              {icon}
            </IconContainer>
          )}
          <StyledInput
            ref={ref}
            hasError={!!error}
            hasIcon={!!icon}
            iconPosition={iconPosition}
            variant={variant}
            size={size}
            {...props}
          />
        </InputWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <HintText>{hint}</HintText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input; 