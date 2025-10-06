import { useDispatch, useSelector } from 'react-redux';

import useUpdate from 'react-use/lib/useUpdate';
import { SettingsKey } from '../../../data/settings-key';
import { ToastUtils } from '../../../he4s/utils';
import { toggleAudioAutoplay } from '../../../state/ducks/userConfig';
import { useHasEnterSendEnabled } from '../../../state/selectors/settings';
import { getAudioAutoplay } from '../../../state/selectors/userConfig';
import { HE4SRadioGroup } from '../../basic/HE4SRadioGroup';
import { BlockedContactsList } from '../BlockedList';
import {
  HE4SSettingsItemWrapper,
  HE4SToggleWithDescription,
} from '../HE4SSettingListItem';

async function toggleCommunitiesPruning() {
  try {
    const newValue = !(await window.getOpengroupPruning());

    // make sure to write it here too, as this is the value used on the UI to mark the toggle as true/false
    await window.setSettingValue(SettingsKey.settingsOpengroupPruning, newValue);
    await window.setOpengroupPruning(newValue);
    ToastUtils.pushRestartNeeded();
  } catch (e) {
    window.log.warn('toggleCommunitiesPruning change error:', e);
  }
}

const CommunitiesPruningSetting = () => {
  const forceUpdate = useUpdate();
  const isOpengroupPruningEnabled = Boolean(
    window.getSettingValue(SettingsKey.settingsOpengroupPruning)
  );
  return (
    <HE4SToggleWithDescription
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClickToggle={async () => {
        await toggleCommunitiesPruning();
        forceUpdate();
      }}
      title={window.i18n('conversationsMessageTrimmingTrimCommunities')}
      description={window.i18n('conversationsMessageTrimmingTrimCommunitiesDescription')}
      active={isOpengroupPruningEnabled}
    />
  );
};

const SpellCheckSetting = () => {
  const forceUpdate = useUpdate();

  const isSpellCheckActive =
    window.getSettingValue(SettingsKey.settingsSpellCheck) === undefined
      ? true
      : window.getSettingValue(SettingsKey.settingsSpellCheck);
  return (
    <HE4SToggleWithDescription
      onClickToggle={() => {
        window.toggleSpellCheck();
        forceUpdate();
      }}
      title={window.i18n('conversationsSpellCheck')}
      description={window.i18n('conversationsSpellCheckDescription')}
      active={isSpellCheckActive}
    />
  );
};

const AudioMessageAutoPlaySetting = () => {
  const audioAutoPlay = useSelector(getAudioAutoplay);
  const dispatch = useDispatch();
  const forceUpdate = useUpdate();

  return (
    <HE4SToggleWithDescription
      onClickToggle={() => {
        dispatch(toggleAudioAutoplay());
        forceUpdate();
      }}
      title={window.i18n('conversationsAutoplayAudioMessage')}
      description={window.i18n('conversationsAutoplayAudioMessageDescription')}
      active={audioAutoPlay}
    />
  );
};

const EnterKeyFunctionSetting = () => {
  const initialSetting = useHasEnterSendEnabled();
  const selectedWithSettingTrue = 'enterForNewLine';

  const items = [
    {
      label: window.i18n('conversationsEnterSends'),
      value: 'enterForSend',
    },
    {
      label: window.i18n('conversationsEnterNewLine'),
      value: selectedWithSettingTrue,
    },
  ];

  return (
    <HE4SSettingsItemWrapper
      title={window.i18n('conversationsEnter')}
      description={window.i18n('conversationsEnterDescription')}
      inline={false}
    >
      <HE4SRadioGroup
        initialItem={initialSetting ? 'enterForNewLine' : 'enterForSend'}
        group={SettingsKey.hasShiftSendEnabled} // make sure to define this key in your SettingsKey enum
        items={items}
        onClick={(selectedRadioValue: string) => {
          void window.setSettingValue(
            SettingsKey.hasShiftSendEnabled,
            selectedRadioValue === selectedWithSettingTrue
          );
        }}
      />
    </HE4SSettingsItemWrapper>
  );
};

export const CategoryConversations = () => {
  return (
    <>
      <CommunitiesPruningSetting />
      <SpellCheckSetting />
      <AudioMessageAutoPlaySetting />
      <EnterKeyFunctionSetting />
      <BlockedContactsList />
    </>
  );
};
