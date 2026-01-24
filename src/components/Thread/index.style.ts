import { ComposerPrimitive } from '@assistant-ui/react'
import { Space } from 'antd'
import styled from 'styled-components'

export const MessageContainer = styled.div`
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-word;
  background-color: #eff6ff;
  border-radius: 14px;
  padding: 8px 20px;

  & > p {
    margin-bottom: 0;
  }
`

export const ButtomSpace = styled(Space)`
  position: sticky;
  bottom: 0;
  padding-top: 16px;
  background-color: #fff;
  padding: 0 24px;
  & > div:nth-child(2) {
    flex-grow: 1;
  }
`

export const InputSpace = styled(Space)`
  width: 100%;
  & > div:nth-child(1) {
    flex-grow: 1;
  }
`

export const UserInput = styled(ComposerPrimitive.Input)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-grow: 1;
  padding: 10px;
  background-color: #f7f7f8; /* 类似 ChatGPT 的浅背景 */
  border-radius: 12px;
  border: 1px solid #d1d5db; /* 边框颜色 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* 微妙的阴影效果 */
  transition: border-color 0.3s ease; /* 动画效果 */
  outline: none;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
  color: #333;
  min-height: 40px;
  max-height: 200px;
  resize: none;
  transition: background-color 0.5s ease;
  overflow-y: auto;

  &:focus {
    background-color: #fff;
    border-color: #40a9ff;
  }
`
