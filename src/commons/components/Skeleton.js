import React from "react";
import styled from "styled-components";

const Skeleton = () => {
  return (
    <StSkeletonBox>
      <StSkeletonBoxAvatar></StSkeletonBoxAvatar>
      <StSkeletonBoxDescription></StSkeletonBoxDescription>
    </StSkeletonBox>
  );
};

export default Skeleton;

const StSkeletonBox = styled.div`
  margin-bottom: 3px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
`;

const StSkeletonBoxAvatar = styled.div`
  border-radius: 10px;
  width: 48px;
  height: 48px;
  overflow: hidden;
  background: #ccc;
`;

const StSkeletonBoxDescription = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: #ccc;
  width: 40%;
  height: 70px;
  border-radius: 10px;
`;
