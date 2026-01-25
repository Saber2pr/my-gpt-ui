import styled from 'styled-components'

export const Contain = styled.div`
  position: relative;
  width: 452px;
  overflow: hidden;
  border-radius: 8px;
  margin: 8px 0;

  pre {
    margin: 0 !important;
    width: 452px;
    overflow: auto !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
  }

  .Paste {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: rgb(173, 173, 173);
    opacity: 0.5;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
`
