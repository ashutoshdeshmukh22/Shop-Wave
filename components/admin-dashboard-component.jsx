import React from 'react';
import styled from 'styled-components';
import Reports from './admin-reports-component';

const Title = styled.h1`
  font-size: 2em;
  color: #000;
  font-weight: bold;
  line-height: 1em;
`;

const Lead = styled.p`
  font-size: 2em;
  color: black;
  font-weight: normal;
  line-height: 1em;
`;

const Wrapper = styled.section`
  padding: 1em;
  text-align: center;
  background: white;
`;

const imgStyle = {
  width: '100%',
  height: '30%',
};

const Dashboard = () => {
  return (
    <div>
      <Wrapper>
        <Title>Welcome to the Admin Panel</Title>
      </Wrapper>
      <Reports />
    </div>
  );
};

export default Dashboard;
