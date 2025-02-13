// TODO: 有更好的實作方式吧？例如透過 CSS coding 來達成？

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 800px;
  max-height: 600px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
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

export const Title = styled.h1`
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0.5rem 0;
`;

export const Timer = styled.div`
  font-size: 3.2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 1.5rem;
`;

export const Button = styled(motion.button)`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background: #2980b9;
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
  color: #2c3e50;
  margin: 0;
`;

