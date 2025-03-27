import React from 'react'

import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  WebSpeechSynthesisAdapter,
} from '@assistant-ui/react'

import { MyModelAdapterStream } from './myModelAdapterStream'

export interface MyRuntimeProviderProps {
  children: React.ReactNode
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
  // 使用自定义的 ai 接口请求
  // const runtime = useLocalRuntime(MyModelAdapter)
  const runtime = useLocalRuntime(MyModelAdapterStream, {
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
