import { shell } from 'electron';
import { useState } from 'react';
import styled from 'styled-components';

import { useDispatch } from 'react-redux';
import useMount from 'react-use/lib/useMount';
import { SettingsHeader } from './HE4SSettingsHeader';

import { HE4SIconButton } from '../icon';

import { HE4SNotificationGroupSettings } from './HE4SNotificationGroupSettings';

import { he4sPassword } from '../../state/ducks/modalDialog';
import { SectionType, showLeftPaneSection } from '../../state/ducks/section';
import type { PasswordAction, HE4SSettingCategory } from '../../types/ReduxTypes';
import { getPasswordHash } from '../../util/storage';
import { SettingsCategoryAppearance } from './section/CategoryAppearance';
import { CategoryConversations } from './section/CategoryConversations';
import { SettingsCategoryHelp } from './section/CategoryHelp';
import { SettingsCategoryPermissions } from './section/CategoryPermissions';
import { SettingsCategoryPrivacy } from './section/CategoryPrivacy';
import { SettingsCategoryRecoveryPassword } from './section/CategoryRecoveryPassword';

export function displayPasswordModal(
  passwordAction: PasswordAction,
  onPasswordUpdated: (action: string) => void
) {
  window.inboxStore?.dispatch(
    he4sPassword({
      passwordAction,
      onOk: () => {
        onPasswordUpdated(passwordAction);
      },
    })
  );
}

export function getMediaPermissionsSettings() {
  return window.getSettingValue('media-permissions');
}

export function getCallMediaPermissionsSettings() {
  return window.getSettingValue('call-media-permissions');
}

export interface SettingsViewProps {
  category: HE4SSettingCategory;
}

const StyledVersionInfo = styled.div`
  display: flex;
  justify-content: space-between;

  padding: var(--margins-sm) var(--margins-md);
  background: none;
  font-size: var(--font-size-xs);
`;

const StyledSpanHE4SInfo = styled.span`
  opacity: 0.4;
  transition: var(--default-duration);
  user-select: text;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const HE4SInfo = () => {
  return (
    <StyledVersionInfo>
      <StyledSpanHE4SInfo
        onClick={() => {
          void shell.openExternal(
            `https://github.com/oxen-io/he4s-desktop/releases/tag/v${window.versionInfo.version}`
          );
        }}
      >
        v{window.versionInfo.version}
      </StyledSpanHE4SInfo>
      <StyledSpanHE4SInfo>
        <HE4SIconButton
          iconSize="medium"
          iconType="oxen"
          onClick={() => {
            void shell.openExternal('https://oxen.io/');
          }}
        />
      </StyledSpanHE4SInfo>
      <StyledSpanHE4SInfo>{window.versionInfo.commitHash}</StyledSpanHE4SInfo>
    </StyledVersionInfo>
  );
};

const SettingInCategory = (props: {
  category: HE4SSettingCategory;
  onPasswordUpdated: (action: string) => void;
  hasPassword: boolean;
}) => {
  const { category, onPasswordUpdated, hasPassword } = props;

  switch (category) {
    // special case for blocked user
    case 'conversations':
      return <CategoryConversations />;
    case 'appearance':
      return <SettingsCategoryAppearance />;
    case 'notifications':
      return <HE4SNotificationGroupSettings />;
    case 'privacy':
      return (
        <SettingsCategoryPrivacy onPasswordUpdated={onPasswordUpdated} hasPassword={hasPassword} />
      );
    case 'help':
      return <SettingsCategoryHelp />;
    case 'permissions':
      return <SettingsCategoryPermissions />;
    case 'recoveryPassword':
      return <SettingsCategoryRecoveryPassword />;

    // these are just buttons and don't have screens
    case 'clearData':
    case 'messageRequests':
    default:
      return null;
  }
};

const StyledSettingsView = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const StyledSettingsList = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

export const HE4SSettingsView = (props: SettingsViewProps) => {
  const { category } = props;
  const dispatch = useDispatch();

  const [hasPassword, setHasPassword] = useState(true);
  useMount(() => {
    const hash = getPasswordHash();
    setHasPassword(!!hash);
  });

  function onPasswordUpdated(action: string) {
    if (action === 'set' || action === 'change') {
      setHasPassword(true);
      dispatch(showLeftPaneSection(SectionType.Message));
    }

    if (action === 'remove') {
      setHasPassword(false);
    }
  }

  return (
    <div className="he4s-settings">
      <SettingsHeader category={category} />
      <StyledSettingsView>
        <StyledSettingsList>
          <SettingInCategory
            category={category}
            onPasswordUpdated={onPasswordUpdated}
            hasPassword={hasPassword}
          />
        </StyledSettingsList>
        <HE4SInfo />
      </StyledSettingsView>
    </div>
  );
};
