import React from 'react';
import styled from 'styled-components';
import t from 'io-ts';
import { X } from 'react-feather';
import { SiteSetting as ISiteSetting } from '../../sync-storage';

export interface SiteSettingProps {
  siteSetting: t.TypeOf<typeof ISiteSetting>;
}

const Wrapper = styled.ul`
  display: flex;
  list-style: none;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 4px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.16);
`;

const Item = styled.li`
  flex: 1 0 auto;
  color: var(--fg-secondary);
  font-size: 12px;
  margin: 2px 0;

  &:first-child {
    flex: 1 0 160px;
  }
`;

const Title = styled.h4`
  font-size: 14px;
  color: var(--fg-primary);
`;

export const SiteSetting = (props: SiteSettingProps) => {
  const { siteSetting } = props;

  return (
    <Wrapper>
      <Item>
        {siteSetting.thumbnail ? (
          <img src={siteSetting.thumbnail} alt={siteSetting.title} />
        ) : null}

        <Title>{siteSetting.title}</Title>
        <span>{siteSetting.urlMatchPattern}</span>
      </Item>

      <Item>
        <input
          type="checkbox"
          defaultChecked={
            siteSetting.documentTransformerSetting.transformContent
          }
        />
      </Item>

      <Item>
        <input
          type="checkbox"
          defaultChecked={siteSetting.documentTransformerSetting.transformInput}
        />
      </Item>

      <Item>
        <X />
      </Item>
    </Wrapper>
  );
};
