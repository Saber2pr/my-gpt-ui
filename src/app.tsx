import initAIAssistant from './chat'

const h1 = document.createElement('h1')
h1.textContent =
  'Click the bottom right sidebar button to open the AI assistant'
document.body.append(h1)

// 默认执行初始化
initAIAssistant({
  locale: 'zh-CN',
  // welcomeMessage: '有什么可以帮忙的？',
  // suggestions: ['如何用 Typescript 实现 Helloworld？', '物联网是什么？'],
  // placeholder: '给 GPT 发送消息',
  // emptyMessage: '我是AI，可以回答你的问题，请在下方输入框输入你的需求～',
})
