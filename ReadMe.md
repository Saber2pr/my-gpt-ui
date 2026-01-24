### @saber2pr/ai-assistant

Quickly customize your GPT UI.

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
  locale: 'en-US'
});
```

### API Reference

#### `initAIAssistant(config?: AIAssistantConfig, container?: HTMLElement)`

Initializes and mounts the AI assistant.

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
| `containerId` | `string` | `'ai-assistant-root'` | The ID of the container element where the assistant will be mounted. |
| `initialPosition` | `{ x: number; y: number }` | Bottom-right | The initial coordinates of the floating button. |
| `onBeforeChat` | `Function` | - | A hook to intercept and modify messages before they are sent to the AI. |

### Local Development

Start the service:

```sh
yarn install

yarn dev
```
