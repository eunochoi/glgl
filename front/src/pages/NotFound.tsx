import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const NotFound = () => {
  return (
    <BG>
      <span>잘못된 경로로 접속하셨습니다. :(</span>
      <Link to="/home">
        <Button>
          <HomeIcon />
        </Button>
      </Link>
    </BG>
  );
};

export default NotFound;

const BG = styled.div`
  background: rgb(246, 214, 229);
  background: linear-gradient(0deg, rgba(246, 214, 229, 1) 0%, rgba(202, 221, 244, 1) 100%);
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.3em;
  /* font-weight: 600; */
  span {
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 24px;
  }
  button {
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.9em;
    /* font-weight: 600; */
  }

  .scroll {
    overflow: hidden;
  }
`;
