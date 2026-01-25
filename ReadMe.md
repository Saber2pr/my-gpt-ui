### @saber2pr/ai-assistant

Quickly customize your GPT UI.

> Demo see: https://saber2pr.top/

### Installation

```bash
npm install @saber2pr/ai-assistant
# or
yarn add @saber2pr/ai-assistant
```

### Quick Start

Import and initialize in your project:

```typescript
import { initAIAssistant } from '@saber2pr/ai-assistant';

initAIAssistant({
  welcomeMessage: 'Hello! I am your AI assistant. How can I help you today?',
  suggestions: ['How to use this UI?', 'Tell me about assistant-ui'],
  locale: 'en-US',
  theme: () => document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
});
```

### API Reference

#### `initAIAssistant(config?: AIAssistantConfig, container?: HTMLElement)`

Initializes and mounts the AI assistant. This assistant runs entirely in the browser using [web-llm](https://github.com/mlc-ai/web-llm), meaning no backend server is required.

- `config`: Configuration object (optional)
- `container`: The DOM container to mount to, defaults to `document.body`

#### `AIAssistantConfig`

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `welcomeMessage` | `string` | - | The welcome message displayed at the top of the chat. |
| `suggestions` | `string[]` | - | A list of suggested questions to show when the chat is empty. |
| `placeholder` | `string` | - | The placeholder text for the message input box. |
| `emptyMessage` | `string` | - | The message displayed when the thread list is empty. |
| `locale` | `'zh-CN' \| 'en-US'` | `'zh-CN'` | The language locale for the UI. |
| `theme` | `'light' \| 'dark' \| (() => 'light' \| 'dark')` | `'light'` | The theme for the UI. Supports a function for dynamic updates when the drawer opens. |
| `containerId` | `string` | `'ai-assistant-root'` | The ID of the container element where the assistant will be mounted. |
| `initialPosition` | `{ x: number; y: number }` | Bottom-right | The initial coordinates of the floating button. |
| `onBeforeChat` | `Function` | - | A hook to intercept and modify messages before they are sent to the AI. |
| `maxMessages` | `number` | `20` | Maximum number of messages to keep in context. Older messages will be truncated. Set to 0 to disable. |
| `maxContextLength` | `number` | `2500` | Maximum total characters in the context. Messages will be truncated from the oldest if exceeded. Set to 0 to disable. |
| `maxTokens` | `number` | `3200` | Maximum estimated tokens in the context. This prevents exceeding the model's context window. For 4096 context window models, safe value is ~3200 (leaves ~900 tokens buffer). Set to 0 to disable. |

### Local Development

Start the service:

```sh
yarn install

yarn dev
```
