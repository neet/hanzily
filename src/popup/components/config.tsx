import React from 'react';
import styled from 'styled-components';
import t from 'io-ts';
import { SyncStorage } from '../../sync-storage';
import { StateIndicator } from './state-indicator';
import { GlobalStyle } from './global-style';
import { SiteSetting } from './site-setting';

const Wrapper = styled.main`
  width: 390px;
  padding: 0 8px;
`;

const Title = styled.h2`
  color: var(--fg-primary);
  font-weight: bold;
  font-size: 18px;
  margin: 8px 0;
`;

const Section = styled.section`
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  color: var(--fg-primary);
  font-size: 16px;
  font-weight: bold;
  margin: 2px 0;
`;

const SectionDescription = styled.p`
  color: var(--fg-secondary);
  font-size: 14px;
  margin: 0 0 8px;
`;

const SectionHgroup = styled.div`
  display: flex;
`;

const SectionItemTitle = styled.h4`
  flex: 1 0 auto;
  text-align: center;
  color: var(--fg-secondary);
  font-weight: bold;
  font-size: 12px;
  margin: 2px 0;

  &:first-child {
    flex: 1 0 160px;
  }
`;

interface ConfigProps {
  storage: t.TypeOf<typeof SyncStorage>;
}

export const Config: React.SFC<ConfigProps> = React.memo(props => {
  const { storage } = props;

  return (
    <>
      <Wrapper>
        <Title>Hanzily</Title>

        <Section>
          <SectionTitle>有効化</SectionTitle>
          <StateIndicator
            state={storage.preferences.state}
            onClick={() => {}}
          />
        </Section>

        <Section>
          <SectionTitle>サイト別設定</SectionTitle>
          <SectionDescription>
            サイトごとにHanzilyの設定を行います。上位の項目が優先的に適応されます。
          </SectionDescription>

          <SectionHgroup>
            <SectionItemTitle>サイト</SectionItemTitle>
            <SectionItemTitle>入力</SectionItemTitle>
            <SectionItemTitle>表示</SectionItemTitle>
            <SectionItemTitle>その他</SectionItemTitle>
          </SectionHgroup>

          {storage.preferences.siteSettings.map((siteSetting, i) => (
            <SiteSetting
              key={`${i}-${siteSetting.urlMatchPattern}`}
              siteSetting={siteSetting}
            />
          ))}
        </Section>
      </Wrapper>

      <GlobalStyle />
    </>
  );
});
