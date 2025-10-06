/* eslint-disable @typescript-eslint/no-misused-promises */

import useUpdate from 'react-use/lib/useUpdate';
import { SettingsKey } from '../../../data/settings-key';
import { updateConfirmModal } from '../../../state/ducks/modalDialog';
import { HE4SButtonColor } from '../../basic/HE4SButton';
import { SpacerLG } from '../../basic/Text';
import { TypingBubble } from '../../conversation/TypingBubble';

import { UserUtils } from '../../../he4s/utils';
import { ConfigurationSync } from '../../../he4s/utils/job_runners/jobs/ConfigurationSyncJob';
import { HE4SUtilUserProfile } from '../../../he4s/utils/libhe4s/libhe4s_utils_user_profile';
import {
  useHasBlindedMsgRequestsEnabled,
  useHasLinkPreviewEnabled,
} from '../../../state/selectors/settings';
import { Storage } from '../../../util/storage';
import { HE4SSettingButtonItem, HE4SToggleWithDescription } from '../HE4SSettingListItem';
import { displayPasswordModal } from '../HE4SSettings';
import { ConversationTypeEnum } from '../../../models/types';

async function toggleLinkPreviews(isToggleOn: boolean, forceUpdate: () => void) {
  if (!isToggleOn) {
    window.inboxStore?.dispatch(
      updateConfirmModal({
        title: window.i18n('linkPreviewsSend'),
        i18nMessage: { token: 'linkPreviewsSendModalDescription' },
        okTheme: HE4SButtonColor.Danger,
        onClickOk: async () => {
          const newValue = !isToggleOn;
          await window.setSettingValue(SettingsKey.settingsLinkPreview, newValue);
          forceUpdate();
        },
        onClickClose: () => {
          window.inboxStore?.dispatch(updateConfirmModal(null));
        },
      })
    );
  } else {
    await window.setSettingValue(SettingsKey.settingsLinkPreview, false);
    await Storage.put(SettingsKey.hasLinkPreviewPopupBeenDisplayed, false);
    forceUpdate();
  }
}

const TypingBubbleItem = () => {
  return (
    <>
      <SpacerLG />
      <TypingBubble conversationType={ConversationTypeEnum.PRIVATE} isTyping={true} />
    </>
  );
};

export const SettingsCategoryPrivacy = (props: {
  hasPassword: boolean | null;
  onPasswordUpdated: (action: string) => void;
}) => {
  const forceUpdate = useUpdate();
  const isLinkPreviewsOn = useHasLinkPreviewEnabled();
  const areBlindedRequestsEnabled = useHasBlindedMsgRequestsEnabled();

  return (
    <>
      <HE4SToggleWithDescription
        onClickToggle={async () => {
          const old = Boolean(window.getSettingValue(SettingsKey.settingsReadReceipt));
          await window.setSettingValue(SettingsKey.settingsReadReceipt, !old);
          forceUpdate();
        }}
        title={window.i18n('readReceipts')}
        description={window.i18n('readReceiptsDescription')}
        active={window.getSettingValue(SettingsKey.settingsReadReceipt)}
        dataTestId="enable-read-receipts"
      />
      <HE4SToggleWithDescription
        onClickToggle={async () => {
          const old = Boolean(window.getSettingValue(SettingsKey.settingsTypingIndicator));
          await window.setSettingValue(SettingsKey.settingsTypingIndicator, !old);
          forceUpdate();
        }}
        title={window.i18n('typingIndicators')}
        description={window.i18n('typingIndicatorsDescription')}
        active={Boolean(window.getSettingValue(SettingsKey.settingsTypingIndicator))}
        childrenDescription={<TypingBubbleItem />}
      />
      <HE4SToggleWithDescription
        onClickToggle={() => {
          void toggleLinkPreviews(isLinkPreviewsOn, forceUpdate);
        }}
        title={window.i18n('linkPreviewsSend')}
        description={window.i18n('linkPreviewsDescription')}
        active={isLinkPreviewsOn}
      />
      <HE4SToggleWithDescription
        onClickToggle={async () => {
          const toggledValue = !areBlindedRequestsEnabled;
          await window.setSettingValue(SettingsKey.hasBlindedMsgRequestsEnabled, toggledValue);
          await HE4SUtilUserProfile.insertUserProfileIntoWrapper(
            UserUtils.getOurPubKeyStrFromCache()
          );
          await ConfigurationSync.queueNewJobIfNeeded();
          forceUpdate();
        }}
        title={window.i18n('messageRequestsCommunities')}
        description={window.i18n('messageRequestsCommunitiesDescription')}
        active={areBlindedRequestsEnabled}
      />

      {!props.hasPassword ? (
        <HE4SSettingButtonItem
          title={window.i18n('lockApp')}
          description={window.i18n('passwordDescription')}
          onClick={() => {
            displayPasswordModal('set', props.onPasswordUpdated);
            forceUpdate();
          }}
          buttonText={window.i18n('passwordSet')}
          dataTestId={'set-password-button'}
        />
      ) : (
        <>
          {/* We have a password, let's show the 'change' and 'remove' password buttons */}
          <HE4SSettingButtonItem
            title={window.i18n('passwordChange')}
            description={window.i18n('passwordChangeDescription')}
            onClick={() => {
              displayPasswordModal('change', props.onPasswordUpdated);
              forceUpdate();
            }}
            buttonText={window.i18n('passwordChange')}
            dataTestId="change-password-settings-button"
          />
          <HE4SSettingButtonItem
            description={window.i18n('passwordRemoveDescription')}
            onClick={() => {
              displayPasswordModal('remove', props.onPasswordUpdated);
              forceUpdate();
            }}
            buttonColor={HE4SButtonColor.Danger}
            buttonText={window.i18n('passwordRemove')}
            dataTestId="remove-password-settings-button"
          />
        </>
      )}
    </>
  );
};
