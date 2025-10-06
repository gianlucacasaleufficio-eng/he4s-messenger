import { shell } from 'electron';
import { useDispatch } from 'react-redux';
import { updateTermsOfServicePrivacyModal } from '../../state/onboarding/ducks/modals';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Flex } from '../basic/Flex';
import { HE4SButton, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerSM } from '../basic/Text';

export type TermsOfServicePrivacyDialogProps = {
  show: boolean;
};

export function TermsOfServicePrivacyDialog(props: TermsOfServicePrivacyDialogProps) {
  const { show } = props;

  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(updateTermsOfServicePrivacyModal(null));
  };

  if (!show) {
    return null;
  }

  return (
    <HE4SWrapperModal
      title={window.i18n('urlOpen')}
      onClose={onClose}
      showExitIcon={true}
      showHeader={true}
      headerReverse={true}
      additionalClassName={'no-body-padding'}
    >
      <span>{window.i18n('urlOpenBrowser')}</span>
      <SpacerSM />
      <Flex container={true} width={'100%'} justifyContent="center" alignItems="center">
        <HE4SButton
          ariaLabel={'Terms of service button'}
          text={window.i18n('onboardingTos')}
          buttonType={HE4SButtonType.Ghost}
          onClick={() => {
            void shell.openExternal('https://gethe4s.org/terms-of-service');
          }}
          dataTestId="terms-of-service-button"
        />
        <HE4SButton
          ariaLabel={'Privacy policy button'}
          text={window.i18n('onboardingPrivacy')}
          buttonType={HE4SButtonType.Ghost}
          onClick={() => {
            void shell.openExternal('https://gethe4s.org/privacy-policy');
          }}
          dataTestId="privacy-policy-button"
        />
      </Flex>
    </HE4SWrapperModal>
  );
}
