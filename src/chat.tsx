import { Button, Drawer, Spin, Tabs, Progress } from 'antd';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { MessageOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { ThreadListPrimitive } from '@assistant-ui/react';

import { FloatButton } from './styles';
import { MyRuntimeProvider } from './components/MyRuntimeProvider';
import { Thread } from './components/Thread';
import { ThreadList } from './components/ThreadList';
import { LLMContext } from './llm/context';
import { getLLMengine } from './llm/engine';
import { AIAssistantConfig } from './types/assistant';
import { AIConfigContext } from './context';
import { useI18n } from './hooks/useI18n';

const MyApp = ({ config }: { config: AIAssistantConfig }) => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  
  return (
    <AIConfigContext.Provider value={config}>
      <MyAppContent open={open} setOpen={setOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
    </AIConfigContext.Provider>
  )
}

const MyAppContent = ({ 
  open, 
  setOpen, 
  activeTab, 
  setActiveTab 
}: { 
  open: boolean, 
  setOpen: (open: boolean) => void,
  activeTab: string,
  setActiveTab: (tab: string) => void
}) => {
  const { t } = useI18n();
  const [loadingText, setLoadingText] = useState(t('loadingModel'))
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState<any>(null)
  
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = React.useRef({ x: 0, y: 0 })
  const buttonPos = React.useRef({ x: window.innerWidth - 100, y: window.innerHeight - 100 })

  // 当语言切换时，更新初始加载文本
  useEffect(() => {
    if (!engine && !loading) {
      setLoadingText(t('loadingModel'));
    }
  }, [t, engine, loading]);

  // 当弹窗打开且引擎未加载时，开始加载引擎
  useEffect(() => {
    if (open && !engine && !loading) {
      setLoading(true)
      getLLMengine({
        selectedModel: 'Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC',
        initProgressCallback(initProgress) {
          setLoadingText(initProgress.text)
          setLoadingProgress(Math.round(initProgress.progress * 100))
          if (initProgress.progress === 1) {
            setLoading(false)
          }
        }
      }).then(res => {
        setEngine(res)
      }).catch(err => {
        console.error('Failed to load LLM engine:', err)
        setLoading(false)
      })
    }
  }, [open, engine, loading])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - dragStartPos.current.x)
      const deltaY = Math.abs(moveEvent.clientY - dragStartPos.current.y)
      
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true)
      }
      
      if (isDragging || deltaX > 5 || deltaY > 5) {
        const newX = moveEvent.clientX - 32
        const newY = moveEvent.clientY - 32
        setPosition({ x: newX, y: newY })
        buttonPos.current = { x: newX, y: newY }
      }
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      
      // 吸附逻辑
      const centerX = window.innerWidth / 2
      const finalX = buttonPos.current.x < centerX ? 20 : window.innerWidth - 84
      
      // 垂直边界检查
      let finalY = buttonPos.current.y
      if (finalY < 20) finalY = 20
      if (finalY > window.innerHeight - 84) finalY = window.innerHeight - 84

      setPosition({ x: finalX, y: finalY })
      buttonPos.current = { x: finalX, y: finalY }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const showDrawer = () => {
    if (!isDragging) {
      setOpen(true)
    }
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <LLMContext.Provider value={engine}>
      <MyRuntimeProvider>
        <FloatButton 
          onClick={showDrawer}
          onMouseDown={handleMouseDown}
          style={{ 
            left: position.x, 
            top: position.y,
            bottom: 'auto',
            right: 'auto',
            transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          {loading && !engine ? <LoadingOutlined /> : <MessageOutlined />}
        </FloatButton>

        <Drawer
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
              <span>{t('assistantTitle')}</span>
              {!loading && engine && (
                <ThreadListPrimitive.New asChild>
                  <Button 
                    type="text" 
                    icon={<PlusOutlined />} 
                    onClick={() => setActiveTab('chat')}
                  >
                    {t('newChat')}
                  </Button>
                </ThreadListPrimitive.New>
              )}
            </div>
          }
          placement="right"
          onClose={onClose}
          visible={open}
          width={600}
          bodyStyle={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}
        >
          {loading || !engine ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '0 40px'
            }}>
              <Progress 
                type="circle" 
                percent={loadingProgress} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 24, fontSize: 16, color: '#666', textAlign: 'center' }}>
                {loadingText}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                {t('loadingTip')}
              </div>
            </div>
          ) : (
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              items={[
                {
                  key: 'chat',
                  label: t('tabChat'),
                  children: (
                    <div style={{ height: 'calc(100vh - 160px)', overflow: 'hidden' }}>
                      <Thread />
                    </div>
                  ),
                },
                {
                  key: 'history',
                  label: t('tabHistory'),
                  children: (
                    <div style={{ height: 'calc(100vh - 160px)', overflowY: 'auto', padding: '16px 0' }}>
                      <ThreadList onItemClick={() => setActiveTab('chat')} />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Drawer>
      </MyRuntimeProvider>
    </LLMContext.Provider>
  )
}

export const initAIAssistant = (config: AIAssistantConfig = {}, container?: HTMLElement) => {
  const target = container || document.body;
  const rootDiv = document.createElement('div');
  rootDiv.id = 'ai-assistant-root';
  target.appendChild(rootDiv);
  ReactDOM.render(<MyApp config={config} />, rootDiv);
}

export default initAIAssistant;
