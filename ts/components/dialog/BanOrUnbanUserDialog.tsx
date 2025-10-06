import { ChangeEvent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useFocusMount } from '../../hooks/useFocusMount';
import { useConversationPropsById } from '../../hooks/useParamSelector';
import { ConversationModel } from '../../models/conversation';
import {
  sogsV3BanUser,
  sogsV3UnbanUser,
} from '../../he4s/apis/open_group_api/sogsv3/sogsV3BanUnban';
import { getConversationController } from '../../he4s/conversations/ConversationController';
import { PubKey } from '../../he4s/types';
import { ToastUtils } from '../../he4s/utils';
import { BanType, updateBanOrUnbanUserModal } from '../../state/ducks/modalDialog';
import { useIsDarkTheme } from '../../state/selectors/theme';
import { HE4SHeaderSearchInput } from '../HE4SHeaderSearchInput';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Flex } from '../basic/Flex';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerSM } from '../basic/Text';
import { HE4SSpinner } from '../loading';

async function banOrUnBanUserCall(
  convo: ConversationModel,
  textValue: string,
  banType: BanType,
  deleteAll: boolean
) {
  // if we don't have valid data entered by the user
  const pubkey = PubKey.from(textValue);
  if (!pubkey) {
    window.log.info(`invalid pubkey for ${banType} user:${textValue}`);
    ToastUtils.pushInvalidPubKey();
    return false;
  }
  try {
    // this is a v2 opengroup
    const roomInfos = convo.toOpenGroupV2();
    const isChangeApplied =
      banType === 'ban'
        ? await sogsV3BanUser(pubkey, roomInfos, deleteAll)
        : await sogsV3UnbanUser(pubkey, roomInfos);

    if (!isChangeApplied) {
      window?.log?.warn(`failed to ${banType} user: ${isChangeApplied}`);

      // eslint-disable-next-line no-unused-expressions
      banType === 'ban' ? ToastUtils.pushUserBanFailure() : ToastUtils.pushUserUnbanSuccess();
      return false;
    }
    window?.log?.info(`${pubkey.key} user ${banType}ned successfully...`);
    // eslint-disable-next-line no-unused-expressions
    banType === 'ban' ? ToastUtils.pushUserBanSuccess() : ToastUtils.pushUserUnbanSuccess();
    return true;
  } catch (e) {
    window?.log?.error(`Got error while ${banType}ning user:`, e);

    return false;
  }
}

export const BanOrUnBanUserDialog = (props: {
  conversationId: string;
  banType: BanType;
  pubkey?: string;
}) => {
  const { conversationId, banType, pubkey } = props;
  const { i18n } = window;
  const isBan = banType === 'ban';
  const dispatch = useDispatch();
  const isDarkTheme = useIsDarkTheme();
  const convo = getConversationController().get(conversationId);
  const inputRef = useRef(null);

  useFocusMount(inputRef, true);
  const wasGivenAPubkey = Boolean(pubkey?.length);
  const [inputBoxValue, setInputBoxValue] = useState('');
  const [inProgress, setInProgress] = useState(false);

  const sourceConvoProps = useConversationPropsById(pubkey);

  const inputTextToDisplay =
    wasGivenAPubkey && sourceConvoProps
      ? `${sourceConvoProps.displayNameInProfile} ${PubKey.shorten(sourceConvoProps.id)}`
      : undefined;

  /**
   * Ban or Unban a user from an open group
   * @param deleteAll Delete all messages for that user in the group (only works with ban)
   */
  const banOrUnBanUser = async (deleteAll: boolean = false) => {
    const castedPubkey = pubkey?.length ? pubkey : inputBoxValue;

    window?.log?.info(`asked to ${banType} user: ${castedPubkey}, banAndDeleteAll:${deleteAll}`);
    setInProgress(true);
    const isBanned = await banOrUnBanUserCall(convo, castedPubkey, banType, deleteAll);
    if (isBanned) {
      // clear input box
      setInputBoxValue('');
      if (wasGivenAPubkey) {
        dispatch(updateBanOrUnbanUserModal(null));
      }
    }

    setInProgress(false);
  };

  const title = isBan ? window.i18n('banUser') : window.i18n('banUnbanUser');

  const onPubkeyBoxChanges = (e: ChangeEvent<HTMLInputElement>) => {
    setInputBoxValue(e.target.value?.trim() || '');
  };

  /**
   * Starts procedure for banning/unbanning user and all their messages using dialog
   */
  const startBanAndDeleteAllSequence = async () => {
    await banOrUnBanUser(true);
  };

  const buttonText = isBan ? i18n('banUser') : i18n('banUnbanUser');

  return (
    <HE4SWrapperModal
      showExitIcon={true}
      title={title}
      onClose={() => {
        dispatch(updateBanOrUnbanUserModal(null));
      }}
    >
      <Flex container={true} flexDirection="column" alignItems="center">
        <HE4SHeaderSearchInput
          ref={inputRef}
          type="text"
          isDarkTheme={isDarkTheme}
          placeholder={i18n('accountIdEnter')}
          dir="auto"
          onChange={onPubkeyBoxChanges}
          disabled={inProgress || wasGivenAPubkey}
          value={wasGivenAPubkey ? inputTextToDisplay : inputBoxValue}
        />
        <Flex container={true}>
          <HE4SButton
            buttonType={HE4SButtonType.Simple}
            onClick={banOrUnBanUser}
            text={buttonText}
            disabled={inProgress}
          />
          {isBan && (
            <>
              <SpacerSM />
              <HE4SButton
                buttonType={HE4SButtonType.Simple}
                buttonColor={HE4SButtonColor.Danger}
                onClick={startBanAndDeleteAllSequence}
                text={i18n('banDeleteAll')}
                disabled={inProgress}
              />
            </>
          )}
        </Flex>
        <HE4SSpinner loading={inProgress} />
      </Flex>
    </HE4SWrapperModal>
  );
};
