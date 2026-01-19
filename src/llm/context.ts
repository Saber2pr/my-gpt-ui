import { MLCEngine } from '@mlc-ai/web-llm';
import { createContext, useContext } from 'react';

export const LLMContext = createContext<MLCEngine>(null);

export const useLLm = () => {
  const context = useContext(LLMContext)
  return context
}