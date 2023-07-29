import React from 'react';
import styled from 'styled-components';
import TotalProduct from './charts/total-products';
import SalesReport from './charts/sales-report';

const ReportsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
`;

const Reports = () => {
  return (
    <ReportsContainer>
      <h2>Reports</h2>
      {/* <GridContainer>
        <TotalProduct />
        <SalesReport />
      </GridContainer> */}
    </ReportsContainer>
  );
};

export default Reports;
