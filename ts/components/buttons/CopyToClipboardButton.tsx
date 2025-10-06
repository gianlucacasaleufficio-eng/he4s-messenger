import { isEmpty } from 'lodash';
import { useState } from 'react';
import { clipboard } from 'electron';
import { useHotkey } from '../../hooks/useHotkey';
import { ToastUtils } from '../../he4s/utils';
import { HE4SButton, HE4SButtonProps } from '../basic/HE4SButton';
import { HE4SIconButton } from '../icon';
import { HE4SIconButtonProps } from '../icon/HE4SIconButton';

type CopyProps = {
  copyContent?: string;
  onCopyComplete?: (copiedValue: string | undefined) => void;
  hotkey?: boolean;
};

type CopyToClipboardButtonProps = Omit<HE4SButtonProps, 'children' | 'onClick'> & CopyProps;

export const CopyToClipboardButton = (props: CopyToClipboardButtonProps) => {
  const { copyContent, onCopyComplete, hotkey = false, text } = props;
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    try {
      const toCopy = copyContent || text;
      if (!toCopy) {
        throw Error('Nothing to copy!');
      }

      clipboard.writeText(toCopy);

      ToastUtils.pushCopiedToClipBoard();
      setCopied(true);
      if (onCopyComplete) {
        onCopyComplete(text);
      }
    } catch (err) {
      window.log.error('CopyToClipboard:', err);
    }
  };

  useHotkey('c', onClick, !hotkey);

  return (
    <HE4SButton
      aria-label={'copy to clipboard button'}
      {...props}
      text={!isEmpty(text) ? text : copied ? window.i18n('copied') : window.i18n('copy')}
      onClick={onClick}
    />
  );
};

type CopyToClipboardIconProps = Omit<HE4SIconButtonProps, 'children' | 'onClick' | 'iconType'> &
  CopyProps;

export const CopyToClipboardIcon = (props: CopyToClipboardIconProps & { copyContent: string }) => {
  const { copyContent, onCopyComplete, hotkey = false } = props;

  const onClick = () => {
    clipboard.writeText(copyContent);
    ToastUtils.pushCopiedToClipBoard();
    if (onCopyComplete) {
      onCopyComplete(copyContent);
    }
  };

  useHotkey('c', onClick, !hotkey);

  return (
    <HE4SIconButton
      aria-label={'copy to clipboard icon button'}
      padding="0"
      margin="0"
      {...props}
      iconType={'copy'}
      onClick={onClick}
    />
  );
};
