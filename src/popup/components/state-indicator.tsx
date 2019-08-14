import React from 'react';
import styled from 'styled-components';
import t from 'io-ts';
import { Smile } from 'react-feather';
import { Preferences } from '../../sync-storage';

const Wrapper = styled.div<{ appearance: 'enabled' | 'disabled' }>`
  display: flex;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.16);
`;

const Icon = styled.span`
  flex: 0 0 auto;
  display: flex;
  margin: 8px;
  place-items: center;
`;

const Meta = styled.div`
  flex: 1 1 auto;
`;

const State = styled.p`
  font-weight: bold;
  color: var(--fg-primary);
`;

const Description = styled.span`
  color: var(--fg-secondary);
  font-size: 12px;
`;

export interface StateIndicatorProps {
  state: t.TypeOf<typeof Preferences>['state'];
  onClick: () => void;
}

export const StateIndicator = (props: StateIndicatorProps) => {
  const { state, onClick } = props;

  return (
    <Wrapper appearance={state} onClick={onClick}>
      <Icon>
        <Smile />
      </Icon>

      <Meta>
        <State>
          {state === 'enabled' ? 'Hanzilyは有効です' : 'Hanzilyは無効です'}
        </State>
        <Description>クリックで無効化</Description>
      </Meta>
    </Wrapper>
  );
};
