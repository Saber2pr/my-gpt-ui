import styled from 'styled-components'

export const Contain = styled.div`
  position: relative;

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
