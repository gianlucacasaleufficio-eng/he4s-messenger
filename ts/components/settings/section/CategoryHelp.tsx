import { HE4SButtonShape, HE4SButtonType } from '../../basic/HE4SButton';

import { HE4SSettingButtonItem, HE4SSettingsTitleWithLink } from '../HE4SSettingListItem';
import { saveLogToDesktop } from '../../../util/logging';

export const SettingsCategoryHelp = () => {
  return (
    <>
      <HE4SSettingButtonItem
        onClick={() => {
          void saveLogToDesktop();
        }}
        buttonShape={HE4SButtonShape.Square}
        buttonType={HE4SButtonType.Solid}
        buttonText={window.i18n('helpReportABugExportLogs')}
        title={window.i18n('helpReportABug')}
        description={window.i18n('helpReportABugExportLogsSaveToDesktopDescription')}
      />
      <HE4SSettingsTitleWithLink
        title={window.i18n('helpWedLoveYourFeedback')}
        link={'https://gethe4s.org/survey'}
      />
      <HE4SSettingsTitleWithLink
        title={window.i18n('helpHelpUsTranslateHE4S')}
        link={'https://gethe4s.org/translate'}
      />
      <HE4SSettingsTitleWithLink
        title={window.i18n('helpFAQ')}
        link={'https://gethe4s.org/faq'}
      />
      <HE4SSettingsTitleWithLink
        title={window.i18n('helpSupport')}
        link={'https://he4sapp.zendesk.com/hc/en-us'}
      />
    </>
  );
};
