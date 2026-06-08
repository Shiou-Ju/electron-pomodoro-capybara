import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { layouts } from '../themes/layouts';

interface ThemeProps {
  layout: 'portrait' | 'landscape';
}

export const Container = styled.div<ThemeProps>`
  position: relative;
  width: 100%;
  height: 100vh;
  max-width: ${({ layout }) => layouts[layout].styles.container.maxWidth};
  min-height: ${({ layout }) => layouts[layout].styles.container.minHeight};
  margin: 0 auto;
  padding: 1rem 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textPrimary};
`;

export const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: min(2rem, 4vh);
  padding: 1rem;
`;

export const Title = styled.h1<ThemeProps>`
  font-size: ${({ layout }) => layouts[layout].styles.title.fontSize};
  color: ${({ theme }) => theme.textPrimary};
  margin: 0;
  padding-top: 1rem;
  font-weight: 600;
  margin-bottom: ${({ layout }) => layouts[layout].styles.title.marginBottom};
`;

export const Timer = styled.div`
  font-size: 3.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

export const Button = styled(motion.button, {
  shouldForwardProp: (prop) => prop !== 'armed',
})<{ armed?: boolean }>`
  background: ${({ theme, armed }) => (armed ? theme.warning : theme.accent)};
  color: ${({ theme, armed }) => (armed ? theme.warningText : theme.buttonText)};
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: ${({ theme, armed }) =>
      armed ? theme.warningHover : theme.accentHover};
  }

  &:focus-visible {
    outline: 3px solid
      ${({ theme, armed }) => (armed ? theme.warning : theme.focusRing)};
    outline-offset: 2px;
  }
`;

// 暗色 / 亮色切換鈕：右上角低調 icon 鈕
export const ToggleButton = styled(motion.button)`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.surface};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.focusRing};
    outline-offset: 2px;
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

export const CapybaraImage = styled(motion.img)`
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
  object-fit: contain;
`;

export const CompletedText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textPrimary};
  margin: 0;
`;
