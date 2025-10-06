import { compact } from 'lodash';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { getConversationController } from '../../he4s/conversations';
import { PubKey } from '../../he4s/types';
import { ToastUtils } from '../../he4s/utils';
import { Flex } from '../basic/Flex';

import { useConversationPropsById } from '../../hooks/useParamSelector';
import { sogsV3RemoveAdmins } from '../../he4s/apis/open_group_api/sogsv3/sogsV3AddRemoveMods';
import { updateRemoveModeratorsModal } from '../../state/ducks/modalDialog';
import { MemberListItem } from '../MemberListItem';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { HE4SSpinner } from '../loading';
import { Localizer } from '../basic/Localizer';

type Props = {
  conversationId: string;
};

async function removeMods(convoId: string, modsToRemove: Array<string>) {
  if (modsToRemove.length === 0) {
    window?.log?.info('No moderators removed. Nothing todo');
    return false;
  }
  window?.log?.info(`asked to remove moderators: ${modsToRemove}`);
  const modsToRemovePubkey = compact(modsToRemove.map(m => PubKey.from(m)));
  const modsToRemoveNames = modsToRemovePubkey.map(
    m =>
      getConversationController().get(m.key)?.getNicknameOrRealUsernameOrPlaceholder() ||
      window.i18n('unknown')
  );
  try {
    const convo = getConversationController().get(convoId);

    const roomInfos = convo.toOpenGroupV2();

    const res = await sogsV3RemoveAdmins(modsToRemovePubkey, roomInfos);

    if (!res) {
      window?.log?.warn('failed to remove moderators:', res);

      ToastUtils.pushFailedToRemoveFromModerator(modsToRemoveNames);
      return false;
    }
    window?.log?.info(`${modsToRemove} removed from moderators...`);
    ToastUtils.pushUserRemovedFromModerators(modsToRemoveNames);
    return true;
  } catch (e) {
    window?.log?.error('Got error while removing moderator:', e);
    return false;
  }
}

export const RemoveModeratorsDialog = (props: Props) => {
  const { conversationId } = props;
  const [removingInProgress, setRemovingInProgress] = useState(false);
  const [modsToRemove, setModsToRemove] = useState<Array<string>>([]);
  const { i18n } = window;
  const dispatch = useDispatch();
  const closeDialog = () => {
    dispatch(updateRemoveModeratorsModal(null));
  };

  const removeModsCall = async () => {
    if (modsToRemove.length) {
      setRemovingInProgress(true);
      const removed = await removeMods(conversationId, modsToRemove);
      setRemovingInProgress(false);
      if (removed) {
        closeDialog();
      }
    }
  };

  const convoProps = useConversationPropsById(conversationId);
  if (!convoProps || !convoProps.isPublic || !convoProps.weAreAdmin) {
    throw new Error('RemoveModeratorsDialog: convoProps invalid');
  }

  const existingMods = convoProps.groupAdmins || [];
  const hasMods = existingMods.length !== 0;

  return (
    <HE4SWrapperModal title={i18n('adminRemove')} onClose={closeDialog}>
      <Flex container={true} flexDirection="column" alignItems="center">
        {hasMods ? (
          <div className="contact-selection-list">
            {existingMods.map(modId => (
              <MemberListItem
                key={`mod-list-${modId}`}
                pubkey={modId}
                isSelected={modsToRemove.some(m => m === modId)}
                onSelect={(selectedMember: string) => {
                  const updatedList = [...modsToRemove, selectedMember];
                  setModsToRemove(updatedList);
                }}
                onUnselect={(selectedMember: string) => {
                  const updatedList = modsToRemove.filter(m => m !== selectedMember);
                  setModsToRemove(updatedList);
                }}
                disableBg={true}
              />
            ))}
          </div>
        ) : (
          <p>
            <Localizer token="adminRemoveCommunityNone" />
          </p>
        )}

        <div className="he4s-modal__button-group">
          <HE4SButton
            buttonType={HE4SButtonType.Simple}
            onClick={removeModsCall}
            disabled={removingInProgress}
            text={i18n('okay')}
          />
          <HE4SButton
            buttonType={HE4SButtonType.Simple}
            buttonColor={HE4SButtonColor.Danger}
            onClick={closeDialog}
            disabled={removingInProgress}
            text={i18n('cancel')}
          />
        </div>

        <HE4SSpinner loading={removingInProgress} />
      </Flex>
    </HE4SWrapperModal>
  );
};
