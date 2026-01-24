import initAIAssistant from "./chat";

// 默认执行初始化
initAIAssistant({
  // welcomeMessage: '有什么可以帮忙的？',
  // suggestions: ['如何用 Typescript 实现 Helloworld？', '物联网是什么？'],
  // placeholder: '给 GPT 发送消息',
  // emptyMessage: '我是AI，可以回答你的问题，请在下方输入框输入你的需求～',
  async onBeforeChat(messages) {
    const knowledgeContent = await fetch('http://localhost:5001/HTML超文本标记语言/移动端禁用双指放大.md').then(res => res.text())
    return [
      {
        role: "system",
        content: `你是我的博客助手，根据我博客内容回答：移动端禁用双指放大的方法：\n${knowledgeContent}`
      },
      ...messages
    ]
  },
});
