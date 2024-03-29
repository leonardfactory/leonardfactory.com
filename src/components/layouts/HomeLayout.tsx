import * as React from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { HomeEffect } from '../effects/HomeEffect';

interface Props {
  children: React.ReactNode;
}

const Header = styled.header`
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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

const Hero = styled.div`
  position: relative;
`;
const Effect = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export function HomeLayout(props: Props) {
  return (
    <div>
      <Header>
        <Effect>
          <HomeEffect />
        </Effect>
        <Hero>
          <HeaderText>Leonardfactory ✨ </HeaderText>
          <HeaderContent>Ciao!</HeaderContent>
        </Hero>
      </Header>
      {props.children}
    </div>
  );
}
