import type { FC } from 'react'
import { Button } from 'antd'
import React, { useEffect } from 'react'

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
    <ThreadListItemPrimitive.Root
      className="ant-btn"
      style={{ 
        marginTop: '8px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%',
        padding: '8px 12px',
        height: 'auto'
      }}
    >
      <ThreadListItemPrimitive.Trigger
        onClick={onClick}
        style={{
          border: 'none',
          padding: 0,
          background: 'transparent',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemDelete />
    </ThreadListItemPrimitive.Root>
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
    <ThreadListItemPrimitive.Delete asChild>
      <DeleteOutlined />
    </ThreadListItemPrimitive.Delete>
  )
}
