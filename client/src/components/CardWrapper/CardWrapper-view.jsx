import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

CardWrapper.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string
};

const Wrapper = styled.div`
  margin: 24px;
  background-color: white;
  border: 1px solid ${props => props.theme.border};
  border-radius: 5px;
  width: 100%;
  flex-direction: column;
  display: flex;
  `;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  `;

const Title = styled.span`
  font-size: 1.5em;
  font-weight: bold;
  margin: 32px;
  font-family: Lusitana;
  `;

const ChildrenWrapper = styled.div`
  margin: 0 32px;
  display: flex;
  flex: 1;
  flex-direction: column;
`;
export default function CardWrapper(props) {
  return (
    <Wrapper>
      <TitleWrapper>
        <Title>{props.title}</Title>
      </TitleWrapper>
      <ChildrenWrapper>
        {props.children}
      </ChildrenWrapper>
    </Wrapper>
  )
}