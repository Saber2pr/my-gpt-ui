import styled from 'styled-components';

export const DrawerTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 24px;
`;

export const LoadingContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
`;

export const LoadingText = styled.div`
  margin-top: 24px;
  font-size: 16px;
  color: #666;
  text-align: center;
`;

export const LoadingTip = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #999;
`;

export const ChatContainer = styled.div<{ active: boolean }>`
  display: ${props => props.active ? 'block' : 'none'};
  height: calc(100vh - 160px);
`;

export const HistoryContainer = styled.div<{ active: boolean }>`
  display: ${props => props.active ? 'block' : 'none'};
  height: calc(100vh - 160px);
  overflow-y: auto;
`;

export const PoweredBy = styled.div`
  padding: 12px 0;
  text-align: center;
  font-size: 12px;
  color: #bfbfbf;
  border-top: 1px solid #f0f0f0;
  background-color: #fff;
  z-index: 1;
`;

export const PoweredByLink = styled.a`
  color: #bfbfbf;
  text-decoration: underline;
`;
