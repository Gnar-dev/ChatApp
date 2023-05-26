import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import styled from "styled-components";
import { FaRegSmileWink } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  onChildAdded,
  onValue,
  off,
  getDatabase,
  ref as dbRef,
  push,
  update,
  child,
} from "firebase/database";

const ChatRooms = () => {
  //리덕스 이용

  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  //state 관리
  const [show, setShow] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDes, setRoomDes] = useState("");
  const [chatRoomsRef, setChatRoomsRef] = useState(
    dbRef(getDatabase(), "chatRooms")
  );
  const [messagesRef, setMessagesRef] = useState(
    dbRef(getDatabase(), "messages")
  );
  const [chatRooms, setChatRooms] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
  const [activeChatRoomId, setActiveChatRoomId] = useState("");
  const [notifications, setNotifications] = useState([]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleCreateChatRoom = (e) => {
    e.preventDefault();
    if (setRoomName && setRoomDes) {
      addChatRoomFunction();
    }
  };

  const addChatRoomFunction = async () => {
    const key = push(chatRoomsRef).key;
    const newChatRoom = {
      id: key,
      roomName,
      roomDes,
      createdBy: {
        name: user.displayName,
        image: user.photoURL,
      },
    };
    try {
      await update(child(chatRoomsRef, key), newChatRoom);
      setRoomName("");
      setRoomDes("");
      setShow(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <StChatRoomContainer>
      <StChatRoomInner>
        <FaRegSmileWink style={{ marginRight: 10 }} />
        채팅방 (1)
        <FaPlus
          style={{ position: "absolute", right: 0, cursor: "pointer" }}
          onClick={handleShow}
        />
      </StChatRoomInner>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>채팅방 생성하기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateChatRoom}>
            <Form.Group className="mb-3" controlId="roomName">
              <Form.Label>방 이름</Form.Label>
              <Form.Control
                type="text"
                placeholder="방 이름을 적어주세요"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="roomDesc">
              <Form.Label>방 설명</Form.Label>
              <Form.Control
                type="text"
                placeholder="방 상세설명을 적어주세요"
                value={roomDes}
                onChange={(e) => setRoomDes(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleCreateChatRoom}>
            생성하기
          </Button>
        </Modal.Footer>
      </Modal>
    </StChatRoomContainer>
  );
};

export default ChatRooms;

const StChatRoomContainer = styled.div``;
const StChatRoomInner = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;
