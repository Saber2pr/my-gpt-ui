import React from 'react'
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react'
import { MyModelAdapter } from './myModelAdapter'
import { MyModelAdapterStream } from './myModelAdapterStream'

export interface MyRuntimeProviderProps {
  children: React.ReactNode
}

export function MyRuntimeProvider({ children }: MyRuntimeProviderProps) {
  // 使用自定义的 ai 接口请求
  const runtime = useLocalRuntime(MyModelAdapterStream)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
