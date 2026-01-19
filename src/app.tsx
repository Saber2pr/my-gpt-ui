import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { MyRuntimeProvider } from './components/MyRuntimeProvider'
import { Thread } from './components/Thread'
import { ThreadList } from './components/ThreadList'
import { Aside, Content, Layout, Root } from './app.style'
import { LLMContext } from './llm/context'
import { getLLMengine } from './llm/engine'
import { useAsync } from './hooks/useAsync'
import { Spin } from 'antd'

const MyApp = () => {
  const [loadingText, setLoadingText] = useState('loading')
  const [loading, setLoading] = useState(false)

  const { data: engine } = useAsync(async () => getLLMengine({
    selectedModel: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    initProgressCallback(initProgress) {
      setLoadingText(initProgress.text)
      setLoading(initProgress.progress !== 1)
    }
  }), [])

  return (
    <Spin spinning={loading} tip={loadingText}>
      <LLMContext.Provider value={engine}>
        <MyRuntimeProvider>
          <Root>
            <Layout>
              <Aside>
                <ThreadList />
              </Aside>
              <Content>
                <Thread />
              </Content>
            </Layout>
          </Root>
        </MyRuntimeProvider>
      </LLMContext.Provider>
    </Spin>
  )
}

ReactDOM.render(<MyApp />, document.querySelector('#root'))
