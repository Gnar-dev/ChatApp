import React, { useState } from "react";
import UserPanel from "./UserPanel";
import Favorited from "./Favorited";
import DirectMessages from "./DirectMessages";
import ChatRooms from "./ChatRooms";
import styled from "styled-components";
const SidePanel = () => {
  const [activeComponent, setActiveComponent] = useState("");

  return (
    <StSidePanelContainer>
      <UserPanel
        active={activeComponent === "UserPanel"}
        onClick={() => setActiveComponent("UserPanel")}
      />
      <Favorited
        active={activeComponent === "Favorited"}
        onClick={() => setActiveComponent("Favorited")}
      />
      <ChatRooms
        active={activeComponent === "ChatRooms"}
        onClick={() => setActiveComponent("ChatRooms")}
      />
      <DirectMessages
        active={activeComponent === "DirectMessages"}
        onClick={() => setActiveComponent("DirectMessages")}
      />
    </StSidePanelContainer>
  );
};

export default SidePanel;

const StSidePanelContainer = styled.div`
  background-color: #e9e9e9;
  padding: 2rem;
  min-height: 100vh;
  min-width: 275px;
`;
