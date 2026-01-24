import { Alert, Avatar, Button, Card, Space } from 'antd'
import React, { FC, useEffect, useContext } from 'react'
import useSpeechToText from 'react-hook-speech-to-text'

import {
  ArrowDownOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  EditOutlined,
  LeftOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  RightOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons'
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useThreadRuntime,
} from '@assistant-ui/react'

import { MarkdownText } from '../MarkdownText'
import {
  ButtomSpace,
  InputSpace,
  MessageContainer,
  UserInput,
} from './index.style'
import { AIConfigContext } from '../../context'
import { useI18n } from '../../hooks/useI18n'

// 当前聊天对话上下文
export const Thread: FC = () => {
  const config = useContext(AIConfigContext)
  const { t } = useI18n()
  return (
    <ThreadPrimitive.Root style={{ height: '100%' }}>
      <ThreadPrimitive.Viewport style={{ height: '100%', overflowY: 'scroll' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              flexGrow: 1,
              paddingBottom: 48,
            }}
          >
            <div style={{ padding: '0px 24px' }}>
              <ThreadWelcome />

              <ThreadPrimitive.Messages
                components={{
                  UserMessage: UserMessage,
                  EditComposer: EditComposer,
                  AssistantMessage: AssistantMessage,
                }}
              />

              <ThreadPrimitive.If empty={true}>
                {/* 没有数据时的占位 */}
                <Alert
                  style={{
                    margin: '16px 0px',
                    maxWidth: '100%',
                  }}
                  type="warning"
                  message={config.emptyMessage || t('defaultEmpty')}
                />
              </ThreadPrimitive.If>
            </div>
          </div>

          <ButtomSpace style={{ width: '100%', boxSizing: 'border-box' }}>
            <ThreadScrollToBottom />
            <Composer />
          </ButtomSpace>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  )
}

// 滚动到消息底部
const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <Button
        style={{
          width: '47px',
          height: '47px',
          borderRadius: 12,
        }}
        type="dashed"
        icon={<ArrowDownOutlined />}
      ></Button>
    </ThreadPrimitive.ScrollToBottom>
  )
}

// 顶部的欢迎语
const ThreadWelcome: FC = () => {
  const config = useContext(AIConfigContext)
  const { t } = useI18n()
  return (
    <ThreadPrimitive.Empty>
      <Alert
        style={{
          maxWidth: '100%',
        }}
        message={config.welcomeMessage || t('defaultWelcome')}
      />
      <ThreadWelcomeSuggestions />
    </ThreadPrimitive.Empty>
  )
}

// 推荐的预置几个问答
const ThreadWelcomeSuggestions: FC = () => {
  const config = useContext(AIConfigContext)
  const { t, locale } = useI18n()
  const suggestions = config.suggestions || (locale === 'zh-CN' 
    ? ["如何用 Typescript 实现 Helloworld？", "物联网是什么？"]
    : ["How to implement Helloworld in Typescript?", "What is IoT?"])
  
  return (
    <Space style={{ marginTop: 24 }}>
      {suggestions.map((suggestion, index) => (
        <ThreadPrimitive.Suggestion
          key={index}
          prompt={suggestion}
          method="replace"
          style={{ border: 'none', padding: 0 }}
          autoSend
        >
          <Card hoverable>{suggestion}</Card>
        </ThreadPrimitive.Suggestion>
      ))}
    </Space>
  )
}

// 底部的输入框
const Composer: FC = () => {
  const config = useContext(AIConfigContext)
  const { t } = useI18n()
  return (
    <ComposerPrimitive.Root>
      <InputSpace>
        <UserInput rows={1} autoFocus placeholder={config.placeholder || t('defaultPlaceholder')} />
        <ComposerAction />
      </InputSpace>
    </ComposerPrimitive.Root>
  )
}

// 小鸟叽叽喳喳地唱着动听的歌，五颜六色的花朵随风舞动，像是在跟我打招呼，真是太美妙啦！
const SpeechInputButton: FC = () => {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  })

  const threadRuntime = useThreadRuntime()

  useEffect(() => {
    if (interimResult) {
      threadRuntime.composer.setText(interimResult)
    }
  }, [interimResult])

  if (error) {
    console.log(`Web Speech API is not available in this browser.`, error)
    return <></>
  }

  return (
    <Button
      style={{
        width: '47px',
        height: '47px',
        borderRadius: 12,
      }}
      onClick={() => {
        if (isRecording) {
          stopSpeechToText()
        } else {
          startSpeechToText()
        }
      }}
      icon={isRecording ? <LoadingOutlined /> : <AudioOutlined />}
    />
  )
}

// 底部的发送/停止对话消息按钮
const ComposerAction: FC = () => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <Space>
          <ComposerPrimitive.Send asChild>
            <Button
              style={{
                width: '47px',
                height: '47px',
                borderRadius: 12,
              }}
              icon={<SendOutlined />}
            />
          </ComposerPrimitive.Send>
          <SpeechInputButton />
        </Space>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <Button
            style={{
              width: '47px',
              height: '47px',
              borderRadius: 12,
            }}
            icon={<StopOutlined />}
          />
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  )
}

// 用户询问的消息框
const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 16,
      }}
    >
      <Space align="start">
        <div>
          <Space>
            <UserActionBar />
            <MessageContainer>
              <MessagePrimitive.Content />
            </MessageContainer>
          </Space>
          <BranchPicker style={{ marginTop: 8 }} />
        </div>
        <Avatar>Y</Avatar>
      </Space>
    </MessagePrimitive.Root>
  )
}

// 上下文用户消息框的工具栏
const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root hideWhenRunning autohide="not-last">
      <ActionBarPrimitive.Edit asChild>
        <EditOutlined />
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  )
}

// 编辑上下文询问的输入框
const EditComposer: FC = () => {
  const { t } = useI18n()
  return (
    <ComposerPrimitive.Root
      style={{
        padding: '16px 8px',
      }}
    >
      <ComposerPrimitive.Input
        style={{
          width: '100%',
          height: 300,
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          backgroundColor: '#eff6ff',
          borderRadius: '14px',
          border: 'none',
          padding: '8px 20px',
          // @ts-ignore
          borderRadius: '14px',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Space>
          <ComposerPrimitive.Cancel asChild>
            <Button type="default" size="small">
              {t('cancel')}
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button type="primary" size="small">
              {t('send')}
            </Button>
          </ComposerPrimitive.Send>
        </Space>
      </div>
    </ComposerPrimitive.Root>
  )
}

// AI 回答结果的消息框
const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      style={{
        marginTop: 16,
      }}
    >
      <Space align="start">
        <Avatar>AI</Avatar>
        <div
          style={{
            display: 'inline-block',
          }}
        >
          <MessagePrimitive.Content components={{ Text: MarkdownText }} />
          <AssistantActionBar />
          <BranchPicker />
        </div>
      </Space>
    </MessagePrimitive.Root>
  )
}

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      style={{
        marginTop: 8,
      }}
    >
      <Space>
        <ActionBarPrimitive.Copy asChild>
          <div style={{ cursor: 'pointer' }}>
            <MessagePrimitive.If copied>
              <CheckCircleOutlined />
            </MessagePrimitive.If>
            <MessagePrimitive.If copied={false}>
              <CopyOutlined />
            </MessagePrimitive.If>
          </div>
        </ActionBarPrimitive.Copy>
        <ActionBarPrimitive.Reload asChild>
          <RedoOutlined />
        </ActionBarPrimitive.Reload>
        <MessagePrimitive.If speaking>
          <ActionBarPrimitive.StopSpeaking asChild>
            <PauseCircleOutlined />
          </ActionBarPrimitive.StopSpeaking>
        </MessagePrimitive.If>
        <MessagePrimitive.If speaking={false}>
          <ActionBarPrimitive.Speak asChild>
            <PlayCircleOutlined />
          </ActionBarPrimitive.Speak>
        </MessagePrimitive.If>
      </Space>
    </ActionBarPrimitive.Root>
  )
}

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      style={{
        marginTop: 8,
        ...(rest.style || {}),
      }}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <LeftOutlined />
      </BranchPickerPrimitive.Previous>
      <span>
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <RightOutlined />
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  )
}
