export const locales = {
  'zh-CN': {
    assistantTitle: 'AI 助手',
    newChat: '新对话',
    tabChat: '对话',
    tabHistory: '历史列表',
    loadingModel: '正在初始化模型...',
    loadingTip: '首次加载模型可能需要较长时间，请耐心等待',
    noHistory: '暂无历史对话',
    defaultWelcome: '有什么可以帮忙的？',
    defaultPlaceholder: '给 GPT 发送消息',
    defaultEmpty: '我是 AI，可以回答你的问题，请在下方输入框输入你的需求～',
    cancel: '取消',
    send: '发送',
    thinking: '思考中',
    newChatFallback: '新对话',
  },
  'en-US': {
    assistantTitle: 'AI Assistant',
    newChat: 'New Chat',
    tabChat: 'Chat',
    tabHistory: 'History',
    loadingModel: 'Initializing model...',
    loadingTip: 'First load may take a while, please wait patiently',
    noHistory: 'No history',
    defaultWelcome: 'How can I help you?',
    defaultPlaceholder: 'Send a message to GPT',
    defaultEmpty: 'I am an AI, I can answer your questions. Please enter your needs in the input box below~',
    cancel: 'Cancel',
    send: 'Send',
    thinking: 'Thinking...',
    newChatFallback: 'New Chat',
  }
};

export type LocaleType = keyof typeof locales;
export type i18nKeys = keyof typeof locales['zh-CN'];
