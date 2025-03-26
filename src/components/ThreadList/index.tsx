import type { FC } from 'react'
import { Button } from 'antd'
import React from 'react'

import {
  BookOutlined as ArchiveIcon,
  PlusOutlined as PlusIcon,
} from '@ant-design/icons'
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
} from '@assistant-ui/react'

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
        <PlusIcon />
        开启新对话
      </Button>
    </ThreadListPrimitive.New>
  )
}

// 聊天列表
const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />
}

const ThreadListItem: FC = (props) => {
  return (
    <div className="ant-btn" style={{ marginTop: '16px' }}>
      <ThreadListItemPrimitive.Trigger
        style={{
          border: 'none',
          padding: 0,
          background: 'transparent',
          marginRight: '20px',
        }}
      >
        <ThreadListItemTitle />
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </div>
  )
}

// 点击切换聊天
const ThreadListItemTitle: FC = () => {
  return <ThreadListItemPrimitive.Title fallback={<div>新对话</div>} />
}

// 归档按钮
const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <ArchiveIcon />
    </ThreadListItemPrimitive.Archive>
  )
}
