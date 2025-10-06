import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { useRef } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useMount from 'react-use/lib/useMount';
import { ToastUtils } from '../../he4s/utils';

import { updateEnterPasswordModal } from '../../state/ducks/modalDialog';
import { SpacerSM } from '../basic/Text';

import { useHotkey } from '../../hooks/useHotkey';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';

const StyledModalContainer = styled.div`
  margin: var(--margins-md) var(--margins-sm);
`;

export type EnterPasswordModalProps = {
  setPasswordValid: (value: boolean) => void;
  onClickOk?: () => void;
  onClickClose?: () => void;
};

export const EnterPasswordModal = (props: EnterPasswordModalProps) => {
  const { setPasswordValid, onClickOk, onClickClose } = props;
  const title = window.i18n('he4sRecoveryPassword');

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const onPasswordVerified = () => {
    onClickOk?.();
    dispatch(updateEnterPasswordModal(null));
  };

  const [, verifyPassword] = useAsyncFn(async () => {
    try {
      const passwordValue = passwordInputRef.current?.value;
      if (!passwordValue) {
        ToastUtils.pushToastError(
          'enterPasswordErrorToast',
          window.i18n.stripped('passwordIncorrect')
        );

        return;
      }

      // this throws if the password is invalid.
      await window.onTryPassword(passwordValue);

      setPasswordValid(true);
      onPasswordVerified();
    } catch (e) {
      window.log.error('window.onTryPassword failed with', e);
      ToastUtils.pushToastError(
        'enterPasswordErrorToast',
        window.i18n.stripped('passwordIncorrect')
      );
    }
  });

  const onClose = () => {
    if (onClickClose) {
      onClickClose();
    }
    dispatch(updateEnterPasswordModal(null));
  };

  useMount(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  });

  useHotkey('Enter', (event: KeyboardEvent) => {
    if (event.target === passwordInputRef.current) {
      void verifyPassword();
    }
  });

  return (
    <HE4SWrapperModal
      title={title || window.i18n('passwordEnter')}
      onClose={onClose}
      showExitIcon={true}
    >
      <StyledModalContainer>
        <SpacerSM />

        <div className="he4s-modal__input-group">
          <input
            type="password"
            ref={passwordInputRef}
            data-testid="password-input"
            placeholder={window.i18n('passwordEnter')}
          />
        </div>

        <SpacerSM />

        <div
          className="he4s-modal__button-group"
          style={{ justifyContent: 'center', width: '100%' }}
        >
          <HE4SButton
            text={window.i18n('done')}
            buttonType={HE4SButtonType.Simple}
            onClick={verifyPassword}
            dataTestId="he4s-confirm-ok-button"
          />
          <HE4SButton
            text={window.i18n('cancel')}
            buttonType={HE4SButtonType.Simple}
            buttonColor={HE4SButtonColor.Danger}
            onClick={onClose}
            dataTestId="he4s-confirm-cancel-button"
          />
        </div>
      </StyledModalContainer>
    </HE4SWrapperModal>
  );
};
