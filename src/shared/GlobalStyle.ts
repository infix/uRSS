import { css } from "@emotion/core";

export const GlobalStyle = css`
  @import url('https://fonts.googleapis.com/css?family=Ubuntu&display=swap');

  * {
    font-size: 16px;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Ubuntu', sans-serif;
  }

  ::-webkit-scrollbar {
    width: 0.25rem;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(138,44,226, 0.6);
    &:hover {
      background: rgba(138,44,226, 1);  
    }
  }
`;
