import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useNotification } from '../../contexts/NotificationContext';

// Notification container animations
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

// Container for all notifications
const NotificationsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: ${props => props.theme.zIndex.tooltip};
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
`;

// Individual notification toast
const NotificationToast = styled.div<{ type: 'success' | 'error' | 'info' | 'warning'; isExiting?: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  background-color: var(--card-background);
  color: var(--text-color);
  animation: ${slideIn} 0.3s ease forwards;
  position: relative;
  overflow: hidden;
  
  ${props => props.isExiting && css`
    animation: ${slideOut} 0.3s ease forwards;
  `}
  
  ${props => props.type === 'success' && css`
    border-left: 4px solid var(--success-color);
  `}
  
  ${props => props.type === 'error' && css`
    border-left: 4px solid var(--error-color);
  `}
  
  ${props => props.type === 'info' && css`
    border-left: 4px solid var(--info-color);
  `}
  
  ${props => props.type === 'warning' && css`
    border-left: 4px solid var(--warning-color);
  `}
`;

// Message content
const NotificationContent = styled.div`
  flex: 1;
  margin-right: 8px;
`;

// Message text
const NotificationMessage = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
`;

// Close button
const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--text-primary);
  }
`;

// Icon for each notification type
const NotificationIcon = styled.div<{ type: 'success' | 'error' | 'info' | 'warning' }>`
  margin-right: 12px;
  font-size: var(--font-size-md);
  
  ${props => props.type === 'success' && css`
    color: var(--success-color);
  `}
  
  ${props => props.type === 'error' && css`
    color: var(--error-color);
  `}
  
  ${props => props.type === 'info' && css`
    color: var(--info-color);
  `}
  
  ${props => props.type === 'warning' && css`
    color: var(--warning-color);
  `}
`;

// Get icon for notification type
const getIcon = (type: 'success' | 'error' | 'info' | 'warning') => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'info':
      return 'ℹ';
    case 'warning':
      return '⚠';
    default:
      return 'ℹ';
  }
};

const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  
  return (
    <NotificationsContainer>
      {notifications.map((notification) => (
        <NotificationToast key={notification.id} type={notification.type}>
          <NotificationIcon type={notification.type}>
            {getIcon(notification.type)}
          </NotificationIcon>
          <NotificationContent>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationContent>
          <CloseButton onClick={() => removeNotification(notification.id)}>
            ×
          </CloseButton>
        </NotificationToast>
      ))}
    </NotificationsContainer>
  );
};

export default Notification; 