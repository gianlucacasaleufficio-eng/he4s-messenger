import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import useMount from 'react-use/lib/useMount';
import { SettingsKey } from '../../../data/settings-key';
import { mnDecode } from '../../../he4s/crypto/mnemonic';
import { ProfileManager } from '../../../he4s/profile_manager/ProfileManager';
import { StringUtils } from '../../../he4s/utils';
import { fromHex } from '../../../he4s/utils/String';
import { trigger } from '../../../shims/events';
import {
  AccountCreation,
  setAccountCreationStep,
  setDisplayName,
  setDisplayNameError,
  setHexGeneratedPubKey,
  setRecoveryPassword,
} from '../../../state/onboarding/ducks/registration';
import {
  useDisplayName,
  useDisplayNameError,
  useRecoveryPassword,
} from '../../../state/onboarding/selectors/registration';
import {
  generateMnemonic,
  registerSingleDevice,
  he4sGenerateKeyPair,
} from '../../../util/accountManager';
import { Storage, setSignWithRecoveryPhrase } from '../../../util/storage';
import { Flex } from '../../basic/Flex';
import { SpacerLG, SpacerSM } from '../../basic/Text';
import { HE4SInput } from '../../inputs';
import { resetRegistration } from '../RegistrationStages';
import { ContinueButton, OnboardDescription, OnboardHeading } from '../components';
import { BackButtonWithinContainer } from '../components/BackButton';
import { displayNameIsValid, sanitizeDisplayNameOrToast } from '../utils';

export type AccountDetails = {
  recoveryPassword: string;
  displayName?: string;
};

async function signUp(signUpDetails: AccountDetails) {
  const { displayName, recoveryPassword } = signUpDetails;

  try {
    const validDisplayName = displayNameIsValid(displayName);
    await resetRegistration();
    await registerSingleDevice(recoveryPassword, 'english', validDisplayName);
    await Storage.put(SettingsKey.hasSyncedInitialConfigurationItem, Date.now());
    await setSignWithRecoveryPhrase(false);
    trigger('openInbox');
  } catch (e) {
    await resetRegistration();
    throw e;
  }
}

export const CreateAccount = () => {
  const recoveryPassword = useRecoveryPassword();
  const displayName = useDisplayName();
  const displayNameError = useDisplayNameError();

  const dispatch = useDispatch();

  const generateMnemonicAndKeyPair = async () => {
    if (recoveryPassword === '') {
      const mnemonic = await generateMnemonic();

      let seedHex = mnDecode(mnemonic);
      // handle shorter than 32 bytes seeds
      const privKeyHexLength = 32 * 2;
      if (seedHex.length !== privKeyHexLength) {
        seedHex = seedHex.concat('0'.repeat(32));
        seedHex = seedHex.substring(0, privKeyHexLength);
      }
      const seed = fromHex(seedHex);
      const keyPair = await he4sGenerateKeyPair(seed);
      const newHexPubKey = StringUtils.decode(keyPair.pubKey, 'hex');

      dispatch(setRecoveryPassword(mnemonic));
      dispatch(setHexGeneratedPubKey(newHexPubKey)); // our 'frontend' account ID
    }
  };

  useMount(() => {
    void generateMnemonicAndKeyPair();
  });

  const signUpWithDetails = async () => {
    if (isEmpty(displayName) || !isEmpty(displayNameError)) {
      return;
    }

    try {
      // this throws if the display name is too long
      const validName = await ProfileManager.updateOurProfileDisplayNameOnboarding(displayName);

      await signUp({
        displayName: validName,
        recoveryPassword,
      });

      dispatch(setAccountCreationStep(AccountCreation.Done));
    } catch (err) {
      window.log.error(
        `[onboarding] create account: signUpWithDetails failed! Error: ${err.message || String(err)}`
      );
      dispatch(setAccountCreationStep(AccountCreation.DisplayName));
      // Note: we have to assume here that libhe4s threw an error because the name was too long.
      // The error reported by libhe4s is not localized
      dispatch(setDisplayNameError(window.i18n('displayNameErrorDescriptionShorter')));
    }
  };

  return (
    <BackButtonWithinContainer
      margin={'2px 0 0 -36px'}
      shouldQuitOnClick={true}
      quitI18nMessageArgs={{ token: 'onboardingBackAccountCreation' }}
      callback={() => {
        dispatch(setDisplayName(''));
        dispatch(setRecoveryPassword(''));
        dispatch(setDisplayNameError(undefined));
      }}
    >
      <Flex
        container={true}
        width="100%"
        flexDirection="column"
        alignItems="flex-start"
        margin={'0 0 0 8px'}
      >
        <OnboardHeading>{window.i18n('displayNamePick')}</OnboardHeading>
        <SpacerSM />
        <OnboardDescription>{window.i18n('displayNameDescription')}</OnboardDescription>
        <SpacerLG />
        <HE4SInput
          ariaLabel={window.i18n('displayNameEnter')}
          autoFocus={true}
          disableOnBlurEvent={true}
          type="text"
          placeholder={window.i18n('displayNameEnter')}
          value={displayName}
          onValueChanged={(name: string) => {
            const sanitizedName = sanitizeDisplayNameOrToast(name, setDisplayNameError, dispatch);
            dispatch(setDisplayName(sanitizedName));
          }}
          onEnterPressed={signUpWithDetails}
          error={displayNameError}
          inputDataTestId="display-name-input"
        />
        <SpacerLG />
        <ContinueButton
          onClick={signUpWithDetails}
          disabled={isEmpty(displayName) || !isEmpty(displayNameError)}
        />
      </Flex>
    </BackButtonWithinContainer>
  );
};
