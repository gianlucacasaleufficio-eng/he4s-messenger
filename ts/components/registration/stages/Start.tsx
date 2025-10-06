import { useState } from 'react';
import { useDispatch } from 'react-redux';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';
import { sleepFor } from '../../../he4s/utils/Promise';
import {
  AccountCreation,
  AccountRestoration,
  Onboarding,
  resetOnboardingState,
  setAccountCreationStep,
  setAccountRestorationStep,
  setDirection,
  setOnboardingStep,
} from '../../../state/onboarding/ducks/registration';
import { HE4SButton, HE4SButtonColor } from '../../basic/HE4SButton';
import { SpacerLG } from '../../basic/Text';
import { resetRegistration } from '../RegistrationStages';
import { TermsAndConditions } from '../TermsAndConditions';

// NOTE we want to prevent the buttons from flashing when the app starts
const StyledStart = styled.div<{ ready: boolean }>`
  ${props =>
    !props.ready &&
    `.he4s-button {
    transition: none;
  }`}
`;

export const Start = () => {
  const [ready, setReady] = useState(false);

  const dispatch = useDispatch();

  useMount(() => {
    dispatch(resetOnboardingState());
    void resetRegistration();

    // eslint-disable-next-line more/no-then
    void sleepFor(500).then(() => setReady(true));
  });

  return (
    <StyledStart ready={ready}>
      <HE4SButton
        ariaLabel={'Create account button'}
        buttonColor={HE4SButtonColor.White}
        onClick={() => {
          dispatch(setDirection('forward'));
          dispatch(setAccountCreationStep(AccountCreation.DisplayName));
          dispatch(setOnboardingStep(Onboarding.CreateAccount));
        }}
        text={window.i18n('onboardingAccountCreate')}
        dataTestId="create-account-button"
      />
      <SpacerLG />
      <HE4SButton
        ariaLabel={'Restore account button'}
        buttonColor={HE4SButtonColor.White}
        onClick={() => {
          dispatch(setDirection('forward'));
          dispatch(setOnboardingStep(Onboarding.RestoreAccount));
          dispatch(setAccountRestorationStep(AccountRestoration.RecoveryPassword));
        }}
        text={window.i18n('onboardingAccountExists')}
        dataTestId="existing-account-button"
      />
      <SpacerLG />
      <TermsAndConditions />
    </StyledStart>
  );
};
