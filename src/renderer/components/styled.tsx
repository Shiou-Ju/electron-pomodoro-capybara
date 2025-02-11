// TODO: 有更好的實作方式吧？例如透過 CSS coding 來達成？

import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Container = styled.div`
  max-width: 400px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  overflow: hidden;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
`;

export const Timer = styled.div`
  font-size: 4rem;
  font-weight: bold;
  color: #3498db;
  margin: 1rem 0;
`;

export const Button = styled(motion.button)`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  margin: 0.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background: #2980b9;
  }
`;

export const CapybaraImage = styled(motion.img)`
  width: 150px;
  height: 150px;
  margin: 1rem auto;
  object-fit: contain;
`;
