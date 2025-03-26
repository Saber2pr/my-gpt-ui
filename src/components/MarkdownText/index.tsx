import React, { memo } from 'react'
import remarkGfm from 'remark-gfm'

import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import { Skeleton } from 'antd'
import { CodeBlock } from '../Codeblock'

const MarkdownTextImpl = (props) => {
  // props.status.type 可以拿到当前 ai 对话的进度、状态
  // running、complete、incomplete
  // reason: "cancelled"
  const type = props?.status?.type
  const reason = props?.status?.reason

  if (type === 'incomplete') {
    if (reason === 'cancelled') {
      return (
        <Skeleton.Node
          style={{
            width: 100,
            borderRadius: 14,
            height: '38px',
          }}
        >
          已取消
        </Skeleton.Node>
      )
    }
  }

  if (type === 'running') {
    return (
      <Skeleton.Node
        active
        style={{
          width: 100,
          borderRadius: 14,
          height: '38px',
        }}
      >
        思考中
      </Skeleton.Node>
    )
  }
  return (
    <div
      style={{
        marginTop: 6,
      }}
    >
      <MarkdownTextPrimitive
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
        }}
      />
    </div>
  )
}

export const MarkdownText = memo(MarkdownTextImpl)
