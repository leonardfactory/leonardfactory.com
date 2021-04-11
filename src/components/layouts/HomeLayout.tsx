import * as React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';

interface Props {
  children: React.ReactNode;
}

const Header = styled.header`
  color: white;
  padding: 2em 3em;
  background: rgb(24, 121, 219);
  background: linear-gradient(
    90deg,
    rgba(24, 121, 219, 1) 0%,
    rgba(181, 0, 255, 1) 100%
  );
`;

const HeaderText = styled.h1``;
const HeaderContent = styled.div``;

export function HomeLayout(props: Props) {
  return (
    <div>
      <Header>
        <HeaderText>Leonardfactory ✨ </HeaderText>
        <HeaderContent>Ciao!</HeaderContent>
      </Header>
      {props.children}
    </div>
  );
}
