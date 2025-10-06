import { useState } from 'react';
import useKey from 'react-use/lib/useKey';
import styled from 'styled-components';

import { motion } from 'framer-motion';
import { isEmpty } from 'lodash';
import { useDispatch } from 'react-redux';
import { getConversationController } from '../../../he4s/conversations';
import { PubKey } from '../../../he4s/types';
import { openConversationWithMessages } from '../../../state/ducks/conversations';
import { resetLeftOverlayMode } from '../../../state/ducks/section';
import { HE4SButton } from '../../basic/HE4SButton';
import { HE4SSpinner } from '../../loading';

import { ONSResolve } from '../../../he4s/apis/snode_api/onsResolve';
import { NotFoundError, SnodeResponseError } from '../../../he4s/utils/errors';
import { THEME_GLOBALS } from '../../../themes/globals';
import { Flex } from '../../basic/Flex';
import { SpacerLG, SpacerMD } from '../../basic/Text';
import { HelpDeskButton } from '../../buttons';
import { HE4SInput } from '../../inputs';
import { ConversationTypeEnum } from '../../../models/types';
import { Localizer } from '../../basic/Localizer';

const StyledDescriptionContainer = styled(motion.div)`
  margin: 0 auto;
  text-align: center;
  padding: 0 var(--margins-md);

  .he4s-icon-button {
    border: 1px solid var(--text-secondary-color);
    border-radius: 9999px;
    margin-inline-start: var(--margins-xs);
    transition-duration: var(--default-duration);

    &:hover {
      border-color: var(--text-primary-color);
    }
  }
`;

const HE4SIDDescription = styled.span`
  color: var(--text-secondary-color);
  font-family: var(--font-default);
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  text-align: center;
`;

export const StyledLeftPaneOverlay = styled(Flex)`
  background: var(--background-primary-color);
  overflow-y: auto;
  overflow-x: hidden;

  .he4s-button {
    width: 100%;
  }
`;

export const OverlayMessage = () => {
  const dispatch = useDispatch();

  function closeOverlay() {
    dispatch(resetLeftOverlayMode());
  }

  useKey('Escape', closeOverlay);
  const [pubkeyOrOns, setPubkeyOrOns] = useState('');
  const [pubkeyOrOnsError, setPubkeyOrOnsError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const disableNextButton = !pubkeyOrOns || loading;

  async function openConvoOnceResolved(resolvedHE4SID: string) {
    const convo = await getConversationController().getOrCreateAndWait(
      resolvedHE4SID,
      ConversationTypeEnum.PRIVATE
    );

    // we now want to show a conversation we just started on the leftpane, even if we did not send a message to it yet
    if (!convo.isActive() || convo.isHidden()) {
      // bump the timestamp only if we were not active before
      if (!convo.isActive()) {
        convo.set({ active_at: Date.now() });
      }
      await convo.unhideIfNeeded(false);

      await convo.commit();
    }

    await openConversationWithMessages({ conversationKey: resolvedHE4SID, messageId: null });

    closeOverlay();
  }

  async function handleMessageButtonClick() {
    setPubkeyOrOnsError(undefined);

    if ((!pubkeyOrOns && !pubkeyOrOns.length) || !pubkeyOrOns.trim().length) {
      setPubkeyOrOnsError(window.i18n('accountIdErrorInvalid'));
      return;
    }

    const pubkeyorOnsTrimmed = pubkeyOrOns.trim();
    const validationError = PubKey.validateWithErrorNoBlinding(pubkeyorOnsTrimmed);

    if (!validationError) {
      await openConvoOnceResolved(pubkeyorOnsTrimmed);
      return;
    }

    const isPubkey = PubKey.validate(pubkeyorOnsTrimmed);
    const isGroupPubkey = PubKey.isClosedGroupV3(pubkeyorOnsTrimmed);
    if ((isPubkey && validationError) || isGroupPubkey) {
      setPubkeyOrOnsError(validationError);
      return;
    }

    // this might be an ONS, validate the regex first
    const mightBeOnsName = new RegExp(ONSResolve.onsNameRegex, 'g').test(pubkeyorOnsTrimmed);
    if (!mightBeOnsName) {
      setPubkeyOrOnsError(window.i18n('onsErrorNotRecognized'));
      return;
    }

    setLoading(true);
    try {
      const resolvedHE4SID = await ONSResolve.getHE4SIDForOnsName(pubkeyorOnsTrimmed);
      const idValidationError = PubKey.validateWithErrorNoBlinding(resolvedHE4SID);

      if (idValidationError) {
        setPubkeyOrOnsError(window.i18n('onsErrorNotRecognized'));
        return;
      }

      await openConvoOnceResolved(resolvedHE4SID);
    } catch (e) {
      setPubkeyOrOnsError(
        e instanceof SnodeResponseError
          ? window.i18n('onsErrorUnableToSearch')
          : e instanceof NotFoundError
            ? window.i18n('onsErrorNotRecognized')
            : window.i18n('onsErrorUnableToSearch')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <StyledLeftPaneOverlay
      container={true}
      flexDirection={'column'}
      flexGrow={1}
      alignItems={'center'}
      padding={'var(--margins-md)'}
    >
      <HE4SInput
        ariaLabel="New conversation input"
        autoFocus={true}
        type="text"
        placeholder={window.i18n('accountIdOrOnsEnter')}
        value={pubkeyOrOns}
        onValueChanged={setPubkeyOrOns}
        onEnterPressed={handleMessageButtonClick}
        error={pubkeyOrOnsError}
        centerText={true}
        isTextArea={true}
        inputDataTestId="new-he4s-conversation"
      />
      <SpacerMD />
      <HE4SSpinner loading={loading} />

      {!pubkeyOrOnsError && !loading ? (
        <>
          <StyledDescriptionContainer
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: THEME_GLOBALS['--default-duration-seconds'] }}
          >
            <HE4SIDDescription>
              <Localizer token="messageNewDescriptionDesktop" />
            </HE4SIDDescription>
            <HelpDeskButton style={{ display: 'inline-flex' }} />
          </StyledDescriptionContainer>
          <SpacerLG />
        </>
      ) : null}

      {!isEmpty(pubkeyOrOns) ? (
        <HE4SButton
          ariaLabel={window.i18n('theContinue')}
          text={window.i18n('theContinue')}
          disabled={disableNextButton}
          onClick={handleMessageButtonClick}
          dataTestId="next-new-conversation-button"
        />
      ) : null}
    </StyledLeftPaneOverlay>
  );
};
