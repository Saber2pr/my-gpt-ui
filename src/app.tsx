import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { MyRuntimeProvider } from './components/MyRuntimeProvider'
import { Thread } from './components/Thread'
import { ThreadList } from './components/ThreadList'
import { Aside, Content, Layout, Root, MainContent } from './app.style'
import { LLMContext } from './llm/context'
import { getLLMengine } from './llm/engine'
import { useAsync } from './hooks/useAsync'
import { Spin, Drawer, Button, Tabs } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { ThreadListPrimitive } from '@assistant-ui/react'

const MyApp = () => {
  const [loadingText, setLoadingText] = useState('loading')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  const { data: engine } = useAsync(async () => getLLMengine({
    selectedModel: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
    initProgressCallback(initProgress) {
      setLoadingText(initProgress.text)
      setLoading(initProgress.progress !== 1)
    }
  }), [])

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <Spin spinning={loading} tip={loadingText}>
      <LLMContext.Provider value={engine}>
        <MyRuntimeProvider>
          <Root>
            <Layout>
              <Content>
                <MainContent>
                  <Button type="primary" size="large" onClick={showDrawer}>
                    打开 AI 助手
                  </Button>
                </MainContent>
              </Content>
            </Layout>
          </Root>

          <Drawer
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                <span>AI 助手</span>
                <ThreadListPrimitive.New asChild>
                  <Button 
                    type="text" 
                    icon={<PlusOutlined />} 
                    onClick={() => setActiveTab('chat')}
                  >
                    新对话
                  </Button>
                </ThreadListPrimitive.New>
              </div>
            }
            placement="right"
            onClose={onClose}
            visible={open}
            width={600}
            bodyStyle={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              items={[
                {
                  key: 'chat',
                  label: '对话',
                  children: (
                    <div style={{ height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
                      <Thread />
                    </div>
                  ),
                },
                {
                  key: 'history',
                  label: '历史列表',
                  children: (
                    <div style={{ height: 'calc(100vh - 160px)', overflowY: 'auto', padding: '16px 0' }}>
                      <ThreadList onItemClick={() => setActiveTab('chat')} />
                    </div>
                  ),
                },
              ]}
            />
          </Drawer>
        </MyRuntimeProvider>
      </LLMContext.Provider>
    </Spin>
  )
}

ReactDOM.render(<MyApp />, document.querySelector('#root'))
