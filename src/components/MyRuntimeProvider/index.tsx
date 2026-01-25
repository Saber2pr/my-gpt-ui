import React from 'react'

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  WebSpeechSynthesisAdapter,
} from '@assistant-ui/react'

import { MyModelAdapterStream } from './myModelAdapterStream'
import { useLLm } from '../../llm/context'
import { AIConfigContext } from '../../context'

export interface MyRuntimeProviderProps {
  children: React.ReactNode
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
  const llm = useLLm()
  const config = React.useContext(AIConfigContext)

  const runtime = useLocalRuntime(
    MyModelAdapterStream(
      llm,
      config.onBeforeChat,
      config.maxMessages,
      config.maxContextLength
    ),
    {
      adapters: {
        speech: new WebSpeechSynthesisAdapter(),
      },
    }
  )

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
