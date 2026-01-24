import styled from 'styled-components'

export const Root = styled.div`
  padding: 48px;
`

export const Layout = styled.div`
  margin: 48px;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  display: flex;
  height: 600px;
  background-color: #fff;
`

export const Aside = styled.div`
  display: none;
`

export const Content = styled.div`
  padding: 12px 0px;
  flex-grow: 1;
`

export const MainContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #999;
`

export const FloatButton = styled.div`
  position: fixed;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: #1890ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  z-index: 1000;
  color: #fff;
  font-size: 24px;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.1);
    background-color: #40a9ff;
  }
`
