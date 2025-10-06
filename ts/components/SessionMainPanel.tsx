import { useSelector } from 'react-redux';
import { useAppIsFocused } from '../hooks/useAppFocused';
import { getFocusedSettingsSection } from '../state/selectors/section';

import { SmartHE4SConversation } from '../state/smart/HE4SConversation';
import { HE4SSettingsView } from './settings/HE4SSettings';
import { useHTMLDirection } from '../util/i18n/rtlSupport';

const FilteredSettingsView = HE4SSettingsView as any;

export const HE4SMainPanel = () => {
  const focusedSettingsSection = useSelector(getFocusedSettingsSection);
  const isSettingsView = focusedSettingsSection !== undefined;
  const htmlDirection = useHTMLDirection();

  // even if it looks like this does nothing, this does update the redux store.
  useAppIsFocused();

  if (isSettingsView) {
    return <FilteredSettingsView category={focusedSettingsSection} />;
  }
  return (
    <div className="he4s-conversation">
      <SmartHE4SConversation htmlDirection={htmlDirection} />
    </div>
  );
};
