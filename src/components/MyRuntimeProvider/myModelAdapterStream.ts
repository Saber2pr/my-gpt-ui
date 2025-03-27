import { EVENT_THREAD_SET_TITLE } from '@/constants'
import { Dispatcher } from '@/utils/event'
import { streamRequest } from '@/utils/streamRequest'
import { ChatModelAdapter } from '@assistant-ui/react'

export const MyModelAdapterStream: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    let inputText = ''

    // messages 保存了当前对话的上下文，messages[messages.length - 1] 就是最后一次即当前询问的内容
    const lastItem = messages[messages.length - 1]
    const inputItem = lastItem.content[0]
    if (inputItem.type === 'text') {
      inputText = inputItem.text
    }
    const stream = streamRequest(
      process.env.GPT_API_FRONTEND + '/openapi/v1/app/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GPT_TOKEN}`,
        },
        // 处理参数
        body: JSON.stringify({
          query: inputText,
          stream: true,
        }),
        // 点击取消发送时取消问答
        signal: abortSignal,
        onChange(type, data) {
          if (type === 'complete') {
            Dispatcher.instance.dispatch(EVENT_THREAD_SET_TITLE, {
              id: lastItem.id,
              data: data.slice(0, 20),
            })
          }
        },
      },
    )

    yield* stream
  },
}
