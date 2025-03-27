import type { FC } from 'react'
import { Button } from 'antd'
import React, { useEffect } from 'react'

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadListItemRuntime,
} from '@assistant-ui/react'
import { Dispatcher } from '@/utils/event'
import { EVENT_THREAD_SET_TITLE } from '@/constants'

// 聊天列表
export const ThreadList: FC = () => {
  return (
    <ThreadListPrimitive.Root
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ThreadListNew />
      <ThreadListItems />
    </ThreadListPrimitive.Root>
  )
}

// 点击创建新聊天
const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button type="ghost">
        <PlusOutlined />
        开启新对话
      </Button>
    </ThreadListPrimitive.New>
  )
}

// 聊天列表
const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />
}

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root
      className="ant-btn"
      style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}
    >
      <ThreadListItemPrimitive.Trigger
        style={{
          border: 'none',
          padding: 0,
          background: 'transparent',
          marginRight: '20px',
          width: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block',
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
  return <ThreadListItemPrimitive.Title fallback={<div>新对话</div>} />
}

// 归档按钮
const ThreadListItemDelete: FC = () => {
  return (
    <ThreadListItemPrimitive.Delete asChild>
      <DeleteOutlined />
    </ThreadListItemPrimitive.Delete>
  )
}
