import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { SettingsKey } from '../../data/settings-key';
import { updateHideRecoveryPasswordModal } from '../../state/ducks/modalDialog';
import { showSettingsSection } from '../../state/ducks/section';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Flex } from '../basic/Flex';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerMD } from '../basic/Text';
import { Localizer } from '../basic/Localizer';

const StyledDescriptionContainer = styled.div`
  width: 280px;
  line-height: 120%;
`;

export type HideRecoveryPasswordDialogProps = {
  state: 'firstWarning' | 'secondWarning';
};

export function HideRecoveryPasswordDialog(props: HideRecoveryPasswordDialogProps) {
  const { state } = props;

  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(updateHideRecoveryPasswordModal(null));
  };

  const onConfirmation = async () => {
    await window.setSettingValue(SettingsKey.hideRecoveryPassword, true);
    onClose();
    dispatch(showSettingsSection('privacy'));
  };

  if (isEmpty(state)) {
    return null;
  }

  const leftButtonProps =
    state === 'firstWarning'
      ? {
          text: window.i18n('theContinue'),
          buttonColor: HE4SButtonColor.Danger,
          onClick: () => {
            dispatch(updateHideRecoveryPasswordModal({ state: 'secondWarning' }));
          },
          dataTestId: 'he4s-confirm-ok-button',
        }
      : {
          text: window.i18n('cancel'),
          onClick: onClose,
          dataTestId: 'he4s-confirm-cancel-button',
        };

  const rightButtonProps =
    state === 'firstWarning'
      ? {
          text: window.i18n('cancel'),
          onClick: onClose,
          dataTestId: 'he4s-confirm-cancel-button',
        }
      : {
          text: window.i18n('yes'),
          buttonColor: HE4SButtonColor.Danger,
          onClick: () => {
            void onConfirmation();
          },
          dataTestId: 'he4s-confirm-ok-button',
        };

  return (
    <HE4SWrapperModal
      title={window.i18n('recoveryPasswordHidePermanently')}
      onClose={onClose}
      showExitIcon={false}
      showHeader={true}
      additionalClassName="no-body-padding"
    >
      <StyledDescriptionContainer>
        <Localizer
          token={
            state === 'firstWarning'
              ? 'recoveryPasswordHidePermanentlyDescription1'
              : 'recoveryPasswordHidePermanentlyDescription2'
          }
        />
      </StyledDescriptionContainer>
      <SpacerMD />
      <Flex container={true} justifyContent="center" alignItems="center" width="100%">
        <HE4SButton {...leftButtonProps} buttonType={HE4SButtonType.Ghost} />
        <HE4SButton {...rightButtonProps} buttonType={HE4SButtonType.Ghost} />
      </Flex>
    </HE4SWrapperModal>
  );
}
