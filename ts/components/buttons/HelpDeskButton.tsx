import { shell } from 'electron';
import { HE4SIconButton, HE4SIconSize } from '../icon';
import { HE4SIconButtonProps } from '../icon/HE4SIconButton';

export const HelpDeskButton = (
  props: Omit<HE4SIconButtonProps, 'iconType' | 'iconSize'> & { iconSize?: HE4SIconSize }
) => {
  return (
    <HE4SIconButton
      aria-label="Help desk link"
      {...props}
      iconType="question"
      iconSize={props.iconSize || 10}
      iconPadding={props.iconPadding || '2px'}
      padding={props.padding || '0'}
      dataTestId="he4s-link-helpdesk"
      onClick={() => {
        void shell.openExternal(
          'https://he4sapp.zendesk.com/hc/en-us/articles/4439132747033-How-do-HE4S-ID-usernames-work'
        );
      }}
    />
  );
};
