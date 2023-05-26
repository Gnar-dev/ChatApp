// import React from "react";

// const MainPanel = () => {
//   return <div>MainPanel</div>;
// };

// export default MainPanel;

import React, { Component } from "react";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import Message from "./Message";
import { styled } from "styled-components";

export class MainPanel extends Component {
  render() {
    return (
      <StMainPanelContainer>
        <MessageHeader />
        <StInner></StInner>
        <MessageForm />
      </StMainPanelContainer>
    );
  }
}

export default MainPanel;

const StMainPanelContainer = styled.div`
  padding: 2rem 2rem 0 2rem;
`;

const StInner = styled.div`
  width: 100%;
  height: 450px;
  border: 0.2rem solid black;
  border-radius:4px;
  padding: 1rem
  margin-bottom: 1rem
  overflow: auto
`;
