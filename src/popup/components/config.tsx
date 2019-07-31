import React from 'react';
import styled from 'styled-components';
import { SyncStorage } from '../../sync-storage';
import { Checkbox } from './checkbox';

const Wrapper = styled.main`
  width: 300px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-feature-settings: 'kern';
  background-size: cover;
  background-attachment: fixed;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  text-rendering: optimizelegibility;
  text-size-adjust: none;
`;

const Title = styled.h2`
  font-size: 18px;
  margin: 8px 0;
`;

interface ConfigProps {
  syncStorage: SyncStorage;
}

export const Config: React.SFC<ConfigProps> = React.memo(props => {
  const { syncStorage } = props;

  return (
    <Wrapper>
      <Title>設定</Title>

      <Checkbox
        label="表示を変換する"
        description="表示されているwebページの内容を非同期で旧字体に変換します"
        storageKey="transform_content"
        defaultValue={syncStorage.transform_content}
      />

      <Checkbox
        label="入力を変換する"
        description="フォーム等に入力された新字体を旧字体に変換します"
        storageKey="transform_input"
        defaultValue={syncStorage.transform_input}
      />
    </Wrapper>
  );
});
