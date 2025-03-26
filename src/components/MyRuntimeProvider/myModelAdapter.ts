import { ChatModelAdapter } from '@assistant-ui/react'

export const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    let inputText = ''

    // messages 保存了当前对话的上下文，messages[messages.length - 1] 就是最后一次即当前询问的内容
    const inputItem = messages[messages.length - 1].content[0]
    if (inputItem.type === 'text') {
      inputText = inputItem.text
    }

    // 调用私有 api
    const result = await fetch('/api/openapi/v1/app/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GPT_TOKEN}`,
      },
      // 处理参数
      body: JSON.stringify({
        query: inputText,
        stream: false,
      }),
      // 点击取消发送时取消问答
      signal: abortSignal,
    })

    // 获得结果
    const data = await result.json()
    return {
      content: [
        {
          type: 'text',
          text: data.text,
        },
      ],
    }
  },
}
