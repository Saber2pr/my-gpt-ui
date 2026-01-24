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
    margin-top: 0;
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
  display: block;
  width: 100%;
  padding: 12px 16px;
  background-color: #f7f7f8;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: #333;
  min-height: 44px;
  max-height: 200px;
  resize: none;
  overflow-y: auto;
  box-sizing: border-box;

  &:focus {
    background-color: #fff;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  &::placeholder {
    color: #bfbfbf;
  }
`
