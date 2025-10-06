import useUpdate from 'react-use/lib/useUpdate';
import { SettingsKey } from '../../../data/settings-key';
import { useHasFollowSystemThemeEnabled } from '../../../state/selectors/settings';
import { ensureThemeConsistency } from '../../../themes/HE4STheme';
import { isHideMenuBarSupported } from '../../../types/Settings';
import { HE4SToggleWithDescription } from '../HE4SSettingListItem';
import { SettingsThemeSwitcher } from '../SettingsThemeSwitcher';
import { ZoomingHE4SSlider } from '../ZoomingHE4SSlider';

export const SettingsCategoryAppearance = () => {
  const forceUpdate = useUpdate();
  const isFollowSystemThemeEnabled = useHasFollowSystemThemeEnabled();

  const isHideMenuBarActive =
    window.getSettingValue(SettingsKey.settingsMenuBar) === undefined
      ? true
      : window.getSettingValue(SettingsKey.settingsMenuBar);

  return (
    <>
      <SettingsThemeSwitcher />
      <ZoomingHE4SSlider />
      {isHideMenuBarSupported() && (
        <HE4SToggleWithDescription
          onClickToggle={() => {
            window.toggleMenuBar();
            forceUpdate();
          }}
          title={window.i18n('appearanceHideMenuBar')}
          description={window.i18n('hideMenuBarDescription')}
          active={isHideMenuBarActive}
        />
      )}
      <HE4SToggleWithDescription
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClickToggle={async () => {
          const toggledValue = !isFollowSystemThemeEnabled;
          await window.setSettingValue(SettingsKey.hasFollowSystemThemeEnabled, toggledValue);
          if (!isFollowSystemThemeEnabled) {
            await ensureThemeConsistency();
          }
        }}
        title={window.i18n('appearanceAutoDarkMode')}
        description={window.i18n('followSystemSettings')}
        active={isFollowSystemThemeEnabled}
        dataTestId="enable-follow-system-theme"
      />
    </>
  );
};
