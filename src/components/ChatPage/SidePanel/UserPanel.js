import React, { useRef } from "react";
import { RiWechat2Line } from "react-icons/ri";
import styled from "styled-components";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../../../firebase";
import { signOut, updateProfile } from "firebase/auth";
import mime from "mime";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { setPhotoUrl } from "../../../redux/actions/userAction.js";
import { getDatabase, ref as dbRef, update } from "firebase/database";
const UserPanel = () => {
  const openImgRef = useRef();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const handleLogout = () => {
    signOut(auth);
  };

  const handleOpenImgRef = () => {
    openImgRef.current.click();
  };

  const handleUploadFirebase = async (e) => {
    const file = e.target.files[0];

    const metadata = { contentType: mime.getType(file.name) };
    try {
      //스토리지에 파일 저장하기
      // Firebase 스토리지 버킷에 대한 참조 가져오기
      const storage = getStorage();

      // 파일을 저장할 위치에 대한 참조 생성
      const storageRefData = storageRef(storage, `user_image/${user.uid}`);

      // 파일 업로드 작업 생성
      const uploadTask = uploadBytesResumable(storageRefData, file, metadata);

      // 업로드가 완료될 때까지 대기하고 스냅샷 가져오기
      const uploadTaskSnapshot = await uploadTask;

      // 업로드된 파일의 다운로드 URL 가져오기
      const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);

      //프로필 이미지 수정
      await updateProfile(auth.currentUser, {
        photoURL: downloadURL,
      });

      dispatch(setPhotoUrl(downloadURL));

      //데이터베이스 유저 이미지 수정
      await update(dbRef(getDatabase(), `users/${user.uid}`), {
        image: downloadURL,
      });
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <StContainerDiv>
      <StHeader>
        <StHeaderDiv>Chat App</StHeaderDiv>
        <RiWechat2Line />
      </StHeader>
      <StProfileDiv>
        <Image
          src={user?.photoURL}
          roundedCircle
          style={{ width: "40px", height: "40px", marginTop: "1px" }}
        />
        <Dropdown>
          <Dropdown.Toggle
            id="dropdown-basic"
            style={{
              background: "transparent",
              border: "none",
              color: "black",
            }}
          >
            {user?.displayName}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleOpenImgRef}>
              프로필사진 변경
            </Dropdown.Item>
            <Dropdown.Item onClick={handleLogout}>로그아웃</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <StChangeImgInput
          accept="image/jpg, image/png"
          type="file"
          ref={openImgRef}
          onChange={handleUploadFirebase}
        />
      </StProfileDiv>
    </StContainerDiv>
  );
};

export default UserPanel;

const StContainerDiv = styled.div``;
const StHeader = styled.h2`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;
const StHeaderDiv = styled.div`
  color: black;
  display: flex;
  font-weight: bold;
`;

const StProfileDiv = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const StChangeImgInput = styled.input`
  display: none;
`;
