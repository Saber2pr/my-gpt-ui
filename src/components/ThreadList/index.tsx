import type { FC } from 'react'
import { Button } from 'antd'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadListItemRuntime,
  useAssistantRuntime,
} from '@assistant-ui/react'
import { Dispatcher } from '../../utils/event'
import { EVENT_THREAD_SET_TITLE } from '../../constants'

import { Empty } from 'antd'
import { useI18n } from '../../hooks/useI18n'

const StyledThreadListItem = styled(ThreadListItemPrimitive.Root)`
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #f0f0f0;
  background: #fafafa;

  &:hover {
    background-color: #f5f5f5;
    border-color: #d9d9d9;
  }

  &[data-active='true'] {
    background-color: #e6f7ff;
    border-color: #91d5ff;
    color: #1890ff;
  }
`

const StyledTrigger = styled(ThreadListItemPrimitive.Trigger)`
  border: none;
  padding: 0;
  background: transparent;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: inherit;
`

const StyledDeleteButton = styled(ThreadListItemPrimitive.Delete)`
  margin-left: 8px;
  color: #bfbfbf;
  transition: all 0.2s;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #ff4d4f;
    background-color: rgba(255, 77, 79, 0.1);
  }
`

// 聊天列表
export const ThreadList: FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  return (
    <ThreadListPrimitive.Root
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ThreadListItems onItemClick={onItemClick} />
    </ThreadListPrimitive.Root>
  )
}

// 点击创建新聊天
const ThreadListNew: FC = () => {
  const { t } = useI18n()
  return (
    <ThreadListPrimitive.New asChild>
      <Button type="primary" icon={<PlusOutlined />} style={{ width: '100%', marginBottom: 16 }}>
        {t('newChat')}
      </Button>
    </ThreadListPrimitive.New>
  )
}

// 聊天列表
const ThreadListItems: FC<{ onItemClick?: () => void }> = ({ onItemClick }) => {
  const runtime = useAssistantRuntime()
  const threads = runtime.threads.getState().threads
  const { t } = useI18n()

  return (
    <>
      <ThreadListPrimitive.Items
        components={{
          ThreadListItem: (props) => (
            <ThreadListItem {...props} onClick={onItemClick} />
          ),
        }}
      />
      {threads.length === 0 && (
        <Empty description={t('noHistory')} style={{ marginTop: 48 }} />
      )}
    </>
  )
}

const ThreadListItem: FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <StyledThreadListItem>
      <StyledTrigger onClick={onClick}>
        <ThreadListItemTitle />
      </StyledTrigger>
      <ThreadListItemDelete />
    </StyledThreadListItem>
  )
}

// 点击切换聊天
const ThreadListItemTitle: FC = () => {
  const runtime = useThreadListItemRuntime()
  const { t } = useI18n()
  useEffect(() => {
    const handle = (event: { id: string; data: string }) => {
      const state = runtime.getState()
      if (state.isMain) {
        runtime.rename(event.data)
      }
    }
    Dispatcher.instance.addEventListener(EVENT_THREAD_SET_TITLE, handle)
    return () => {
      Dispatcher.instance.removeEventListener(EVENT_THREAD_SET_TITLE, handle)
    }
  }, [runtime])
  return <ThreadListItemPrimitive.Title fallback={<div>{t('newChatFallback')}</div>} />
}

// 归档按钮
const ThreadListItemDelete: FC = () => {
  return (
    <StyledDeleteButton asChild>
      <DeleteOutlined />
    </StyledDeleteButton>
  )
}
