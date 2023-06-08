import styled, { keyframes } from "styled-components";
import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Image from "react-bootstrap/Image";
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa";
import {
  MdFavorite,
  MdFavoriteBorder,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import { RiMoreFill } from "react-icons/ri";
import { AiOutlineSearch } from "react-icons/ai";
import { useSelector } from "react-redux";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  child,
  update,
} from "firebase/database";

const MessageHeader = ({ handleSearchChange }) => {
  const chatRoom = useSelector((state) => state.chatRoom.currentChatRoom);
  const isPrivateChatRoom = useSelector(
    (state) => state.chatRoom.isPrivateChatRoom
  );
  const [isFavorited, setIsFavorited] = useState(false);
  const [isViewMoreVisible, setIsViewMoreVisible] = useState("false");
  const usersRef = ref(getDatabase(), "users");
  const user = useSelector((state) => state.user.currentUser);
  const userPosts = useSelector((state) => state.chatRoom.userPosts);
  const database = getDatabase();
  const usersFavoritedRef = chatRoom
    ? ref(database, `users/${user.uid}/favorited/${chatRoom.id}`)
    : ref(getDatabase());

  useEffect(() => {
    if (chatRoom && user) {
      addFavoriteListener(chatRoom.id, user.uid);
    }
    if (!usersFavoritedRef) {
      return null;
    }
    //eslint-disable-next-line
  }, [chatRoom, user]);

  const addFavoriteListener = (chatRoomId, userId) => {
    onValue(child(usersRef, `${userId}/favorited`), (data) => {
      if (data.val() !== null) {
        const chatRoomIds = Object.keys(data.val());
        const isAlreadyFavorited = chatRoomIds.includes(chatRoomId);
        setIsFavorited(isAlreadyFavorited);
      }
    });
  };

  const handleFavorite = () => {
    if (isFavorited) {
      setIsFavorited((prev) => !prev);
      remove(usersFavoritedRef);
    } else {
      setIsFavorited((prev) => !prev);
      const newFavorite = {
        roomName: chatRoom.roomName,
        roomDes: chatRoom.roomDes,
        createdBy: {
          name: chatRoom.createdBy.name,
          image: chatRoom.createdBy.image,
        },
      };
      update(ref(database, `users/${user.uid}/favorited`), {
        [chatRoom.id]: newFavorite,
      });
    }
  };

  

  const renderUserPosts = (userPosts) =>
    Object.entries(userPosts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, val], i) => (
        <div key={i} style={{ display: "flex" }}>
          <img
            style={{ borderRadius: 25 }}
            width={48}
            height={48}
            className="mr-3"
            src={val.image}
            alt={val.name}
          />
          <div>
            <h6>{key}</h6>
            <p>{val.count} 개</p>
          </div>
        </div>
      ));

  const handleViewMoreClick = () => {
    setIsViewMoreVisible("true");
  };

  const handleGoBackClick = () => {
    setIsViewMoreVisible("false");
    setTimeout(() => {
      setIsViewMoreVisible("false");
    }, 500); // 0.5초 후에 setIsViewMoreVisible(false) 호출
  };

  return (
    <StMessageHeaderContainer>
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Row
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: "12px",
          }}
        >
          <Col
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <StHeader>
              <StPrivateIcon>
                {isPrivateChatRoom ? <FaLock /> : <FaLockOpen />}
              </StPrivateIcon>
              <StRoomName>
                {isPrivateChatRoom ? chatRoom?.name : chatRoom?.roomName}
              </StRoomName>
              {!isPrivateChatRoom && (
                <StFavorite onClick={handleFavorite}>
                  {isFavorited ? <MdFavorite /> : <MdFavoriteBorder />}
                </StFavorite>
              )}
            </StHeader>
          </Col>

          <Col
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <StCreateInfo>만든이 : </StCreateInfo>
            {!isPrivateChatRoom ? (
              <StCreateUser>
                <Image
                  src={chatRoom?.createdBy.image}
                  roundedCircle
                  style={{ width: "30px", height: "30px" }}
                />
                <StCreateName>
                  {chatRoom && chatRoom.createdBy.name}
                </StCreateName>
              </StCreateUser>
            ) : (
              <StCreateUser>
                <Image
                  src={user.photoURL}
                  roundedCircle
                  style={{ width: "30px", height: "30px" }}
                />
                <StCreateName>{user.displayName}</StCreateName>
              </StCreateUser>
            )}
            <StViewMoreIcon onClick={handleViewMoreClick}>
              <RiMoreFill size="32" color="#000" />
            </StViewMoreIcon>
          </Col>
        </Row>
        <Row
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <InputGroup>
            <InputGroup.Text id="basic-addon1">
              <AiOutlineSearch />
            </InputGroup.Text>
            <FormControl
              onChange={handleSearchChange}
              placeholder="Search Messages"
              aria-label="Search"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </Row>
      </Container>
      <StViewMoreBox isvisible={isViewMoreVisible}>
        <StGobackIcon onClick={handleGoBackClick}>
          <MdOutlineKeyboardDoubleArrowRight size="32" />
        </StGobackIcon>
        <div>
          <div>포스팅한 수</div>
        </div>
        <div>{userPosts && renderUserPosts(userPosts)}</div>
        <StViewMoreBoxRoomDes>
          <StViewMoreBoxRoomDesHeader>
            채팅방 상세설명
          </StViewMoreBoxRoomDesHeader>
          <StViewMoreBoxRoomDesBody>
            {chatRoom && chatRoom.roomDes}
          </StViewMoreBoxRoomDesBody>
        </StViewMoreBoxRoomDes>
      </StViewMoreBox>
    </StMessageHeaderContainer>
  );
};

export default MessageHeader;

const StMessageHeaderContainer = styled.div`
  width: 100%;
  height: 170px;
  border: 0.2rem solid #ececec;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
`;
const StHeader = styled.h3`
  display: flex;
  margin: 0;
  gap: 10px;
`;

const StPrivateIcon = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
`;

const StFavorite = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  cursor: pointer;
`;
const StRoomName = styled.div`
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
`;

const StCreateInfo = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const StCreateName = styled.div`
  margin-left: 5px;
  font-weight: 700;
`;
const StCreateUser = styled.div`
  display: flex;
  align-items: center;
`;

const StViewMoreIcon = styled.div`
  cursor: pointer;
`;

const StViewMoreBox = styled.div`
  z-index: 1;
  position: absolute;
  background: #e9e9e9;
  width: 325px;
  height: 100vh;
  top: 0;
  bottom: 0;
  right: ${({ isvisible }) => (isvisible === "true" ? "0" : "-325px")};
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${({ isvisible }) =>
      isvisible === "true" ? slideInAnimation : slideOutAnimation}
    0.8s;
`;

const StGobackIcon = styled.div`
  display: inline-block;
  margin-bottom: 2rem;
  display: flex;
  cursor: pointer;
  width: 32px;
`;

//애니메이션
const slideInAnimation = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);
  }
`;

const slideOutAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
`;

const StViewMoreBoxRoomDes = styled.div`
  display: flex;
  flex-direction: column;
`;

const StViewMoreBoxRoomDesHeader = styled.div`
  display: flex;
  flex-direction: column;
`;
const StViewMoreBoxRoomDesBody = styled.div`
  display: flex;
  flex-direction: column;
`;
