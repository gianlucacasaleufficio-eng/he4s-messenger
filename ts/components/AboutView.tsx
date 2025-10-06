import { useEffect } from 'react';
import styled from 'styled-components';
import { HE4STheme } from '../themes/HE4STheme';
import { switchThemeTo } from '../themes/switchTheme';
import { HE4SToastContainer } from './HE4SToastContainer';
import { Flex } from './basic/Flex';
import { HE4SButtonType } from './basic/HE4SButton';
import { CopyToClipboardButton } from './buttons/CopyToClipboardButton';

const StyledContent = styled(Flex)`
  background-color: var(--background-primary-color);
  color: var(--text-primary-color);
  text-align: center;

  font-family: var(--font-default);
  font-size: var(--font-size-sm);
  height: 100%;
  width: 100%;

  a {
    color: var(--text-primary-color);
  }

  img:first-child {
    filter: brightness(0) saturate(100%) invert(75%) sepia(84%) saturate(3272%) hue-rotate(103deg)
      brightness(106%) contrast(103%);
    margin: var(--margins-2xl) 0 var(--margins-lg);
  }

  img:nth-child(2) {
    filter: var(--he4s-logo-text-current-filter);
    margin-bottom: var(--margins-xl);
  }

  .he4s-button {
    font-size: var(--font-size-sm);
    font-weight: 400;
    min-height: var(--font-size-sm);
    font-size: var(--font-size-sm);
    margin-bottom: var(--margins-xs);
  }
`;

export const AboutView = () => {
  // Add debugging metadata - environment if not production, app instance name
  const environmentStates = [];

  if (window.getEnvironment() !== 'production') {
    environmentStates.push(window.getEnvironment());
  }

  if (window.getAppInstance()) {
    environmentStates.push(window.getAppInstance());
  }

  const versionInfo = `v${window.getVersion()}`;
  const systemInfo = window.i18n('systemInformationDesktop', {
    information: window.getOSRelease(),
  });
  const commitInfo = window.i18n('commitHashDesktop', {
    hash: window.getCommitHash() || window.i18n('unknown'),
  });

  useEffect(() => {
    if (window.theme) {
      void switchThemeTo({
        theme: window.theme,
        usePrimaryColor: true,
      });
    }
  }, []);

  return (
    <HE4STheme runSetup={false}>
      <HE4SToastContainer />
      <StyledContent
        container={true}
        flexDirection={'column'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <img
          src="images/he4s/he4s_icon.png"
          alt="he4s brand icon"
          width="200"
          height="200"
        />
        <img
          src="images/he4s/he4s-text.svg"
          alt="he4s brand text"
          width={192}
          height={26}
        />
        <CopyToClipboardButton
          className="version"
          text={versionInfo}
          buttonType={HE4SButtonType.Simple}
        />
        <CopyToClipboardButton
          className="os"
          text={systemInfo}
          buttonType={HE4SButtonType.Simple}
        />
        <CopyToClipboardButton
          className="commitHash"
          text={commitInfo}
          buttonType={HE4SButtonType.Simple}
        />
        {environmentStates.length ? (
          <CopyToClipboardButton
            className="environment"
            text={environmentStates.join(' - ')}
            buttonType={HE4SButtonType.Simple}
          />
        ) : null}
        <a href="https://gethe4s.org">https://gethe4s.org</a>
        <br />
        <a className="privacy" href="https://gethe4s.org/privacy-policy">
          {window.i18n('onboardingPrivacy')}
        </a>
        <a className="privacy" href="https://gethe4s.org/terms-of-service/">
          {window.i18n('onboardingTos')}
        </a>
        <br />
      </StyledContent>
    </HE4STheme>
  );
};
