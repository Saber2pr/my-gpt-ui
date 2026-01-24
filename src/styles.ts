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
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #1890ff 0%, #0050b3 100%);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  z-index: 1000;
  color: #fff;
  font-size: 24px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.1) rotate(5deg);
    background: linear-gradient(135deg, #40a9ff 0%, #096dd9 100%);
    box-shadow: 0 8px 24px rgba(24, 144, 255, 0.45);
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 30px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0.5;
    pointer-events: none;
  }

  .anticon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`
