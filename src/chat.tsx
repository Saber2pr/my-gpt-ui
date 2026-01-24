import { Button, ConfigProvider, Drawer, Progress, Tabs, theme as antdTheme } from 'antd';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { LoadingOutlined, MessageOutlined, PlusOutlined } from '@ant-design/icons';
import { ThreadListPrimitive } from '@assistant-ui/react';

import { MyRuntimeProvider } from './components/MyRuntimeProvider';
import { Thread } from './components/Thread';
import { ThreadList } from './components/ThreadList';
import { AIConfigContext } from './context';
import { useI18n } from './hooks/useI18n';
import { LLMContext } from './llm/context';
import { getLLMengine } from './llm/engine';
import { FloatButton } from './styles';
import { AIAssistantConfig } from './types/assistant';
import {
  ChatContainer,
  DrawerTitle,
  HistoryContainer,
  LoadingContainer,
  LoadingText,
  LoadingTip,
  PoweredBy,
  PoweredByLink,
} from './chat.style';

const MyApp = ({ config }: { config: AIAssistantConfig }) => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    if (typeof config.theme === 'function') {
      return config.theme();
    }
    return config.theme || 'light';
  });

  useEffect(() => {
    if (open && typeof config.theme === 'function') {
      setCurrentTheme(config.theme());
    }
  }, [open, config.theme]);

  return (
    <AIConfigContext.Provider value={config}>
      <ConfigProvider
        theme={{
          algorithm: currentTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        }}
      >
        <MyAppContent open={open} setOpen={setOpen} activeTab={activeTab} setActiveTab={setActiveTab} config={config} />
      </ConfigProvider>
    </AIConfigContext.Provider>
  )
}

const MyAppContent = ({
  open,
  setOpen,
  activeTab,
  setActiveTab,
  config
}: {
  open: boolean,
  setOpen: (open: boolean) => void,
  activeTab: string,
  setActiveTab: (tab: string) => void,
  config: AIAssistantConfig
}) => {
  const { t } = useI18n();
  const [loadingText, setLoadingText] = useState(t('loadingModel'))
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState<any>(null)

  const defaultPos = config.initialPosition || { x: window.innerWidth - 100, y: window.innerHeight - 100 }
  const [position, setPosition] = useState(defaultPos)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = React.useRef({ x: 0, y: 0 })
  const buttonPos = React.useRef(defaultPos)
  const lastWindowSize = React.useRef({ width: window.innerWidth, height: window.innerHeight })

  // 监听窗口大小变化，修正按钮位置
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      setPosition(prev => {
        // 计算按钮相对于右侧和底部的距离比例，或者简单的保持吸附状态
        const isAtRight = prev.x > lastWindowSize.current.width / 2;

        let newX = prev.x;
        // 如果原本在右侧，放大窗口时让它跟随右侧边缘
        if (isAtRight) {
          const offsetRight = lastWindowSize.current.width - prev.x;
          newX = currentWidth - offsetRight;
        }

        // 垂直方向同理，如果靠下，保持相对底部的距离
        const isAtBottom = prev.y > lastWindowSize.current.height / 2;
        let newY = prev.y;
        if (isAtBottom) {
          const offsetBottom = lastWindowSize.current.height - prev.y;
          newY = currentHeight - offsetBottom;
        }

        // 最终边界安全检查
        const safeX = Math.max(20, Math.min(newX, currentWidth - 84));
        const safeY = Math.max(20, Math.min(newY, currentHeight - 84));

        buttonPos.current = { x: safeX, y: safeY };
        return { x: safeX, y: safeY };
      });

      lastWindowSize.current = { width: currentWidth, height: currentHeight };
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            touchAction: 'none',
            opacity: open ? 0 : 1,
            pointerEvents: open ? 'none' : 'auto',
            transform: open ? 'scale(0) rotate(-20deg)' : (isDragging ? 'scale(1.05)' : 'scale(1)')
          }}
        >
          {loading && !engine ? <LoadingOutlined /> : <MessageOutlined />}
        </FloatButton>

        <Drawer
          title={
            <DrawerTitle>
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
            </DrawerTitle>
          }
          placement="right"
          onClose={onClose}
          open={open}
          width={600}
          bodyStyle={{ padding: '0 16px', display: 'flex', flexDirection: 'column' }}
        >
          {loading || !engine ? (
            <LoadingContainer>
              <Progress
                type="circle"
                percent={loadingProgress}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <LoadingText>
                {loadingText}
              </LoadingText>
              <LoadingTip>
                {t('loadingTip')}
              </LoadingTip>
            </LoadingContainer>
          ) : (
            <>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  { key: 'chat', label: t('tabChat') },
                  { key: 'history', label: t('tabHistory') },
                ]}
              />
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <ChatContainer active={activeTab === 'chat'}>
                  <Thread />
                </ChatContainer>
                <HistoryContainer active={activeTab === 'history'}>
                  <ThreadList onItemClick={() => setActiveTab('chat')} />
                </HistoryContainer>
              </div>
            </>
          )}
          <PoweredBy>
            Powerd by <PoweredByLink href="https://github.com/Saber2pr/ai-assistant/" target="_blank" rel="noreferrer">ai-assistant</PoweredByLink>
          </PoweredBy>
        </Drawer>
      </MyRuntimeProvider>
    </LLMContext.Provider>
  )
}


export const initAIAssistant = (config: AIAssistantConfig = {}, container?: HTMLElement) => {
  const target = container || document.body;
  const rootDiv = document.createElement('div');
  rootDiv.id = config.containerId || 'ai-assistant-root';
  target.appendChild(rootDiv);
  ReactDOM.render(<MyApp config={config} />, rootDiv);
}

export default initAIAssistant;
