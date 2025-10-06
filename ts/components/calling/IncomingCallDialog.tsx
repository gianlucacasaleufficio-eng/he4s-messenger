import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';
import { useConversationUsername } from '../../hooks/useParamSelector';
import { CallManager } from '../../he4s/utils';
import { ed25519Str } from '../../he4s/utils/String';
import { callTimeoutMs } from '../../he4s/utils/calling/CallManager';
import { getHasIncomingCall, getHasIncomingCallFrom } from '../../state/selectors/call';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Avatar, AvatarSize } from '../avatar/Avatar';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';

export const CallWindow = styled.div`
  position: absolute;
  z-index: 9;
  padding: 1rem;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  background-color: var(--modal-background-content-color);
  border: 1px solid var(--border-color);
`;

const IncomingCallAvatarContainer = styled.div`
  padding: 0 0 2rem 0;
`;

export const IncomingCallDialog = () => {
  const hasIncomingCall = useSelector(getHasIncomingCall);
  const incomingCallFromPubkey = useSelector(getHasIncomingCallFrom);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (incomingCallFromPubkey) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timeout = global.setTimeout(async () => {
        if (incomingCallFromPubkey) {
          window.log.info(
            `call missed with ${ed25519Str(
              incomingCallFromPubkey
            )} as the dialog was not interacted with for ${callTimeoutMs} ms`
          );
          await CallManager.USER_rejectIncomingCallRequest(incomingCallFromPubkey);
        }
      }, callTimeoutMs);
    }

    return () => {
      if (timeout) {
        global.clearTimeout(timeout);
      }
    };
  }, [incomingCallFromPubkey]);

  // #region input handlers
  const handleAcceptIncomingCall = async () => {
    if (incomingCallFromPubkey) {
      await CallManager.USER_acceptIncomingCallRequest(incomingCallFromPubkey);
    }
  };

  const handleDeclineIncomingCall = async () => {
    // close the modal
    if (incomingCallFromPubkey) {
      await CallManager.USER_rejectIncomingCallRequest(incomingCallFromPubkey);
    }
  };
  const from = useConversationUsername(incomingCallFromPubkey);
  if (!hasIncomingCall || !incomingCallFromPubkey) {
    return null;
  }
  // #endregion

  if (hasIncomingCall) {
    return (
      <HE4SWrapperModal
        title={window.i18n('callsIncoming', {
          name: from ?? window.i18n('unknown'),
        })}
      >
        <IncomingCallAvatarContainer>
          <Avatar size={AvatarSize.XL} pubkey={incomingCallFromPubkey} />
        </IncomingCallAvatarContainer>
        <div className="he4s-modal__button-group">
          <HE4SButton
            text={window.i18n('accept')}
            buttonType={HE4SButtonType.Simple}
            onClick={handleAcceptIncomingCall}
          />
          <HE4SButton
            text={window.i18n('decline')}
            buttonColor={HE4SButtonColor.Danger}
            buttonType={HE4SButtonType.Simple}
            onClick={handleDeclineIncomingCall}
          />
        </div>
      </HE4SWrapperModal>
    );
  }
  // display spinner while connecting
  return null;
};
