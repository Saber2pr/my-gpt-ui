import { CreateMLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
export interface GetLLmengineProps {
  selectedModel?: string;
  initProgressCallback?: InitProgressCallback
}

export const getLLMengine = async ({selectedModel = 'Llama-3.1-8B-Instruct-q4f32_1-MLC', initProgressCallback}: GetLLmengineProps) => {
  const engine = await CreateMLCEngine(
    selectedModel,
    { initProgressCallback }, // engineConfig
  );
  return engine;
}