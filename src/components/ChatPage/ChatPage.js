import React from "react";
import SidePanel from "./SidePanel/SidePanel";
import MainPanel from "./MainPanel/MainPanel";
import styled from "styled-components";
const ChatPage = () => {
  return (
    <StChatPageContainer>
      <StSidePanelContainer>
        <SidePanel />
      </StSidePanelContainer>
      <StMainPanelContainer>
        <MainPanel />
      </StMainPanelContainer>
    </StChatPageContainer>
  );
};

export default ChatPage;

const StChatPageContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
`;

const StSidePanelContainer = styled.div`
  width: 300px;
`;
const StMainPanelContainer = styled.div`
  width: 100%;
`;
