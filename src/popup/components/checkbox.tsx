import React, { useCallback } from 'react';
import { browser } from 'webextension-polyfill-ts';
import styled from 'styled-components';

const Wrapper = styled.label`
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const Input = styled.input`
  margin: 6px;
`;

const Meta = styled.div`
  flex-grow: 1;
`;

const Label = styled.h4`
  color: #333333;
  margin: 0;
  margin-bottom: 4px;
`;

const Description = styled.p`
  color: #666666;
  margin: 0;
  margin-bottom: 4px;
`;

interface CheckboxProps {
  storageKey: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

export const Checkbox: React.SFC<CheckboxProps> = React.memo(props => {
  const { label, description, defaultValue, storageKey } = props;

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      browser.storage.sync.set({ [storageKey]: e.currentTarget.checked });
    },
    [storageKey],
  );

  return (
    <Wrapper>
      <Input
        type="checkbox"
        defaultChecked={defaultValue}
        onChange={onChange}
      />

      <Meta>
        <Label>{label}</Label>
        <Description>{description}</Description>
      </Meta>
    </Wrapper>
  );
});
