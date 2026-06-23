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
  color: ${({ theme, armed }) =>
    armed ? theme.warningText : theme.buttonText};
  border: none;
  min-width: 7.5rem;
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

// 暗色 / 亮色切換鈕：右上角低調文字鈕
export const ToggleButton = styled(motion.button)`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  border: none;
  border-radius: 1rem;
  font-size: 0.95rem;
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

// 計時器設定列：− [分鐘] +
export const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
`;

export const StepButton = styled(motion.button)`
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.6rem;
  line-height: 1;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.buttonText};
  }

  &:focus-visible {
    outline: 3px solid ${({ theme }) => theme.focusRing};
    outline-offset: 2px;
  }
`;

export const MinutesDisplay = styled.div`
  font-size: 3.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
  min-width: 5rem;
  text-align: center;
`;

export const MinutesUnit = styled.span`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.7;
  margin-left: 0.2rem;
`;

// gi 直接輸入分鐘用
export const MinutesInput = styled.input`
  font-size: 3.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
  background: transparent;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.accent};
  width: 5rem;
  text-align: center;
  padding: 0;

  &:focus {
    outline: none;
  }

  /* 隱藏 number spinner（保險，實際用 text + inputMode=numeric） */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

// 模式切換鈕（番茄鐘 ⇄ 計時器）：放在暗色鈕左側
export const ModeToggleButton = styled(motion.button)`
  position: absolute;
  top: 0.75rem;
  right: 3.75rem;
  height: 2rem;
  min-width: 2rem;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  border: none;
  border-radius: 1rem;
  font-size: 0.95rem;
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

export const StreakText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.textPrimary};
  margin: 0;
`;
