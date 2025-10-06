import { useState } from 'react';
import { useDispatch } from 'react-redux';
import useKey from 'react-use/lib/useKey';
import { CSSProperties } from 'styled-components';
import { updateQuitModal } from '../../state/onboarding/ducks/modals';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Flex } from '../basic/Flex';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerLG, SpacerSM } from '../basic/Text';
import { HE4SConfirmDialogProps } from './HE4SConfirm';
import { StyledI18nSubText } from '../basic/StyledI18nSubText';

const modalStyle: CSSProperties = {
  maxWidth: '300px',
  width: '100%',
  lineHeight: 1.4,
};

export const QuitModal = (props: HE4SConfirmDialogProps) => {
  const dispatch = useDispatch();
  const {
    title = '',
    i18nMessage,
    okTheme,
    closeTheme = HE4SButtonColor.Danger,
    onClickOk,
    onClickClose,
    onClickCancel,
    closeAfterInput = true,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const okText = props.okText || window.i18n('okay');
  const cancelText = props.cancelText || window.i18n('cancel');

  const onClickOkHandler = async () => {
    if (onClickOk) {
      setIsLoading(true);
      try {
        await onClickOk();
      } catch (e) {
        window.log.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (closeAfterInput) {
      dispatch(updateQuitModal(null));
    }
  };

  /**
   * Performs specified on close action then removes the modal.
   */
  const onClickCancelHandler = () => {
    onClickCancel?.();
    onClickClose?.();
    dispatch(updateQuitModal(null));
  };

  useKey('Enter', () => {
    void onClickOkHandler();
  });

  useKey('Escape', () => {
    onClickCancelHandler();
  });

  return (
    <HE4SWrapperModal
      title={title}
      onClose={onClickClose}
      showExitIcon={false}
      showHeader={true}
      additionalClassName={'no-body-padding'}
    >
      {i18nMessage ? (
        <Flex
          container={true}
          width={'100%'}
          justifyContent="center"
          alignItems="center"
          style={modalStyle}
        >
          <SpacerLG />
          <StyledI18nSubText {...i18nMessage}></StyledI18nSubText>
          <SpacerLG />
        </Flex>
      ) : null}
      <SpacerSM />
      <Flex container={true} width={'100%'} justifyContent="center" alignItems="center">
        <HE4SButton
          text={okText}
          buttonColor={okTheme}
          buttonType={HE4SButtonType.Ghost}
          onClick={onClickOkHandler}
          disabled={isLoading}
          dataTestId="he4s-confirm-ok-button"
        />
        <HE4SButton
          text={cancelText}
          buttonColor={!okTheme ? closeTheme : undefined}
          buttonType={HE4SButtonType.Ghost}
          onClick={onClickCancelHandler}
          disabled={isLoading}
          dataTestId="he4s-confirm-cancel-button"
        />
      </Flex>
    </HE4SWrapperModal>
  );
};
