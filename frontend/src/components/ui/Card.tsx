import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  isFullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}

const CardContainer = styled.div<Omit<CardProps, 'children' | 'title' | 'subtitle'>>`
  background: var(--card-background);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all var(--transition-default);
  width: ${props => props.isFullWidth ? '100%' : 'auto'};
  
  ${props => props.variant === 'default' && css`
    border: 1px solid var(--border-color);
  `}
  
  ${props => props.variant === 'elevated' && css`
    border: none;
    box-shadow: var(--shadow-md);
    
    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }
  `}
  
  ${props => props.variant === 'outlined' && css`
    background: transparent;
    border: 1px solid var(--border-color);
    
    &:hover {
      border-color: var(--primary-color);
    }
  `}
  
  ${props => props.padding === 'none' && css`
    padding: 0;
  `}
  
  ${props => props.padding === 'small' && css`
    padding: var(--spacing-sm);
  `}
  
  ${props => props.padding === 'medium' && css`
    padding: var(--spacing-md);
  `}
  
  ${props => props.padding === 'large' && css`
    padding: var(--spacing-lg);
  `}
  
  ${props => props.onClick && css`
    cursor: pointer;
  `}
`;

const CardHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid var(--border-color);
`;

const CardTitle = styled.h3`
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
`;

const CardSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
`;

const CardBody = styled.div<{ hasHeader: boolean; padding: CardProps['padding'] }>`
  ${props => props.padding === 'none' && css`
    padding: 0;
  `}
  
  ${props => props.padding === 'small' && css`
    padding: var(--spacing-sm);
  `}
  
  ${props => props.padding === 'medium' && css`
    padding: var(--spacing-md);
  `}
  
  ${props => props.padding === 'large' && css`
    padding: var(--spacing-lg);
  `}
  
  ${props => props.hasHeader && props.padding !== 'none' && css`
    padding-top: ${props.padding === 'small' ? 'var(--spacing-sm)' : 
                  props.padding === 'medium' ? 'var(--spacing-md)' : 
                  props.padding === 'large' ? 'var(--spacing-lg)' : '0'};
  `}
`;

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  variant = 'default', 
  padding = 'medium', 
  isFullWidth = false,
  onClick,
  className
}) => {
  const hasHeader = Boolean(title || subtitle);
  
  return (
    <CardContainer 
      variant={variant} 
      padding={hasHeader ? 'none' : padding}
      isFullWidth={isFullWidth}
      onClick={onClick}
      className={className}
    >
      {hasHeader && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        </CardHeader>
      )}
      <CardBody hasHeader={hasHeader} padding={padding}>
        {children}
      </CardBody>
    </CardContainer>
  );
};

export default Card; 