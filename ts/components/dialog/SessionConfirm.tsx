import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import useKey from 'react-use/lib/useKey';
import { useLastMessage } from '../../hooks/useParamSelector';
import { updateConversationInteractionState } from '../../interactions/conversationInteractions';
import { ConversationInteractionStatus } from '../../interactions/types';
import { updateConfirmModal } from '../../state/ducks/modalDialog';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { HE4SRadioGroup, HE4SRadioItems } from '../basic/HE4SRadioGroup';
import { SpacerLG } from '../basic/Text';
import { HE4SSpinner } from '../loading';
import type { LocalizerComponentPropsObject } from '../../types/localizer';

import { StyledI18nSubText } from '../basic/StyledI18nSubText';

export interface HE4SConfirmDialogProps {
  i18nMessage?: LocalizerComponentPropsObject;
  i18nMessageSub?: LocalizerComponentPropsObject;
  title?: string;
  radioOptions?: HE4SRadioItems;
  onOk?: any;
  onClose?: any;
  closeAfterInput?: boolean;

  /**
   * function to run on ok click. Closes modal after execution by default
   * sometimes the callback might need arguments when using radioOptions
   */
  onClickOk?: (...args: Array<any>) => Promise<void> | void;

  onClickClose?: () => any;

  /**
   * function to run on close click. Closes modal after execution by default
   */
  onClickCancel?: () => any;

  okText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  okTheme?: HE4SButtonColor;
  closeTheme?: HE4SButtonColor;
  showExitIcon?: boolean | undefined;
  headerReverse?: boolean;
  conversationId?: string;
}

export const HE4SConfirm = (props: HE4SConfirmDialogProps) => {
  const dispatch = useDispatch();
  const {
    title = '',
    i18nMessage,
    i18nMessageSub,
    radioOptions,
    okTheme,
    closeTheme = HE4SButtonColor.Danger,
    onClickOk,
    onClickClose,
    hideCancel = false,
    onClickCancel,
    showExitIcon,
    headerReverse,
    closeAfterInput = true,
    conversationId,
  } = props;

  const lastMessage = useLastMessage(conversationId);

  const [isLoading, setIsLoading] = useState(false);
  const [chosenOption, setChosenOption] = useState(
    radioOptions?.length ? radioOptions[0].value : ''
  );

  const okText = props.okText || window.i18n('okay');
  const cancelText = props.cancelText || window.i18n('cancel');
  const showHeader = !!props.title;

  const onClickOkHandler = async () => {
    if (onClickOk) {
      setIsLoading(true);
      try {
        await onClickOk(chosenOption !== '' ? chosenOption : undefined);
      } catch (e) {
        window.log.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (closeAfterInput) {
      dispatch(updateConfirmModal(null));
    }
  };

  useKey('Enter', () => {
    void onClickOkHandler();
  });

  useKey('Escape', () => {
    onClickCancelHandler();
  });

  useEffect(() => {
    if (isLoading) {
      if (conversationId && lastMessage?.interactionType) {
        void updateConversationInteractionState({
          conversationId,
          type: lastMessage?.interactionType,
          status: ConversationInteractionStatus.Loading,
        });
      }
    }
  }, [isLoading, conversationId, lastMessage?.interactionType]);

  /**
   * Performs specified on close action then removes the modal.
   */
  const onClickCancelHandler = () => {
    onClickCancel?.();
    onClickClose?.();
    window.inboxStore?.dispatch(updateConfirmModal(null));
  };

  return (
    <HE4SWrapperModal
      title={title}
      onClose={onClickClose}
      showExitIcon={showExitIcon}
      showHeader={showHeader}
      headerReverse={headerReverse}
    >
      {!showHeader && <SpacerLG />}

      <div className="he4s-modal__centered">
        {i18nMessage ? <StyledI18nSubText {...i18nMessage} /> : null}
        {i18nMessageSub ? (
          <StyledI18nSubText {...i18nMessageSub} className="he4s-confirm-sub-message" />
        ) : null}
        {radioOptions && chosenOption !== '' ? (
          <HE4SRadioGroup
            group="he4s-confirm-radio-group"
            initialItem={chosenOption}
            items={radioOptions}
            radioPosition="right"
            onClick={value => {
              if (value) {
                setChosenOption(value);
              }
            }}
          />
        ) : null}
        <HE4SSpinner loading={isLoading} />
      </div>

      <div className="he4s-modal__button-group">
        <HE4SButton
          text={okText}
          buttonColor={okTheme}
          buttonType={HE4SButtonType.Simple}
          onClick={onClickOkHandler}
          dataTestId="he4s-confirm-ok-button"
        />
        {!hideCancel && (
          <HE4SButton
            text={cancelText}
            buttonColor={!okTheme ? closeTheme : undefined}
            buttonType={HE4SButtonType.Simple}
            onClick={onClickCancelHandler}
            dataTestId="he4s-confirm-cancel-button"
          />
        )}
      </div>
    </HE4SWrapperModal>
  );
};
