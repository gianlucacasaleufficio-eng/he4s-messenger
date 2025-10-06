/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useKey from 'react-use/lib/useKey';

import { HE4SJoinableRooms } from './HE4SJoinableDefaultRooms';

import {
  joinOpenGroupV2WithUIEvents,
  JoinSogsRoomUICallbackArgs,
} from '../../../he4s/apis/open_group_api/opengroupV2/JoinOpenGroupV2';
import { openGroupV2CompleteURLRegex } from '../../../he4s/apis/open_group_api/utils/OpenGroupUtils';
import { resetLeftOverlayMode } from '../../../state/ducks/section';
import { HE4SButton } from '../../basic/HE4SButton';
import { HE4SSpinner } from '../../loading';

import {
  markConversationInitialLoadingInProgress,
  openConversationWithMessages,
} from '../../../state/ducks/conversations';
import { getLeftOverlayMode } from '../../../state/selectors/section';
import { Spacer2XL } from '../../basic/Text';
import { HE4SInput } from '../../inputs';
import { StyledLeftPaneOverlay } from './OverlayMessage';
import LIBSESSION_CONSTANTS from '../../../he4s/utils/libhe4s/libhe4s_constants';

async function joinOpenGroup(
  serverUrl: string,
  errorHandler: (error: string) => void,
  uiCallback?: (args: JoinSogsRoomUICallbackArgs) => void
) {
  // guess if this is an open
  if (serverUrl.match(openGroupV2CompleteURLRegex)) {
    const groupCreated = await joinOpenGroupV2WithUIEvents(
      serverUrl,
      false,
      false,
      uiCallback,
      errorHandler
    );
    return groupCreated;
  }
  throw new Error(window.i18n('communityEnterUrlErrorInvalid'));
}

export const OverlayCommunity = () => {
  const dispatch = useDispatch();

  const [groupUrl, setGroupUrl] = useState('');
  const [groupUrlError, setGroupUrlError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const overlayModeIsCommunity = useSelector(getLeftOverlayMode) === 'open-group';

  function closeOverlay() {
    dispatch(resetLeftOverlayMode());
  }

  async function onTryJoinRoom(completeUrl?: string) {
    try {
      if (loading) {
        return;
      }
      setGroupUrlError(undefined);
      const url = (completeUrl && completeUrl.trim()) || (groupUrl && groupUrl.trim());
      await joinOpenGroup(url, setGroupUrlError, joinSogsUICallback);
    } catch (e) {
      setGroupUrlError(e.message);
      window.log.warn(e);
    } finally {
      setLoading(false);
    }
  }

  function joinSogsUICallback(args: JoinSogsRoomUICallbackArgs) {
    setLoading(args.loadingState === 'started');
    if (args.conversationKey) {
      dispatch(
        markConversationInitialLoadingInProgress({
          conversationKey: args.conversationKey,
          isInitialFetchingInProgress: true,
        })
      );
    }
    if (args.loadingState === 'finished' && overlayModeIsCommunity && args.conversationKey) {
      closeOverlay();
      void openConversationWithMessages({ conversationKey: args.conversationKey, messageId: null }); // open to last unread for a he4s run sogs
    }
  }

  useKey('Escape', closeOverlay);

  return (
    <StyledLeftPaneOverlay
      container={true}
      flexDirection={'column'}
      flexGrow={1}
      alignItems={'center'}
      padding={'var(--margins-md)'}
    >
      <HE4SInput
        autoFocus={true}
        type="text"
        placeholder={window.i18n('communityEnterUrl')}
        value={groupUrl}
        onValueChanged={setGroupUrl}
        onEnterPressed={onTryJoinRoom}
        editable={!loading}
        error={groupUrlError}
        // - 1 for null terminator
        maxLength={LIBSESSION_CONSTANTS.COMMUNITY_FULL_URL_MAX_LENGTH - 1}
        textSize="md"
        centerText={true}
        monospaced={true}
        isTextArea={true}
      />
      <Spacer2XL />
      <HE4SButton text={window.i18n('join')} disabled={!groupUrl} onClick={onTryJoinRoom} />
      {!loading ? <Spacer2XL /> : null}
      <HE4SSpinner loading={loading} />
      <HE4SJoinableRooms onJoinClick={onTryJoinRoom} alreadyJoining={loading} />
    </StyledLeftPaneOverlay>
  );
};
