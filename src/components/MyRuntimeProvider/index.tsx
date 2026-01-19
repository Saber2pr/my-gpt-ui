import React from 'react'

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  WebSpeechSynthesisAdapter,
} from '@assistant-ui/react'

import { MyModelAdapterStream } from './myModelAdapterStream'
import { useLLm } from '@/llm/context'

export interface MyRuntimeProviderProps {
  children: React.ReactNode
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
  const llm = useLLm()

  const runtime = useLocalRuntime(MyModelAdapterStream(llm), {
    adapters: {
      speech: new WebSpeechSynthesisAdapter(),
    },
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
