import React from "react";
import SidePanel from "./SidePanel/SidePanel";
import MainPanel from "./MainPanel/MainPanel";
import styled from "styled-components";
import { useSelector } from "react-redux";
const ChatPage = () => {
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  return (
    <StChatPageContainer>
      <StSidePanelContainer>
        <SidePanel />
      </StSidePanelContainer>
      <StMainPanelContainer>
        <MainPanel key={chatRoom && chatRoom.id} />
      </StMainPanelContainer>
    </StChatPageContainer>
  );
};

export default ChatPage;

const StChatPageContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
`;

const StSidePanelContainer = styled.div`
  width: 300px;
`;
const StMainPanelContainer = styled.div`
  width: 100%;
  overflow: hidden;
`;
