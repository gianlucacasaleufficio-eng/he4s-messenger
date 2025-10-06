import { useState } from 'react';

import useKey from 'react-use/lib/useKey';
import { getConversationController } from '../../he4s/conversations';
import { openConversationWithMessages } from '../../state/ducks/conversations';
import { updateUserDetailsModal, UserDetailsModalState } from '../../state/ducks/modalDialog';
import { Avatar, AvatarSize } from '../avatar/Avatar';
import { HE4SButton, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerLG } from '../basic/Text';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { HE4SInput } from '../inputs';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { ConversationTypeEnum } from '../../models/types';
import { Flex } from '../basic/Flex';

export const UserDetailsDialog = (props: UserDetailsModalState) => {
  const [isEnlargedImageShown, setIsEnlargedImageShown] = useState(false);

  const size = isEnlargedImageShown ? AvatarSize.HUGE : AvatarSize.XL;

  function closeDialog() {
    window.inboxStore?.dispatch(updateUserDetailsModal(null));
  }

  async function onClickStartConversation() {
    if (!props) {
      return;
    }
    const convo = getConversationController().get(props.conversationId);

    const conversation = await getConversationController().getOrCreateAndWait(
      convo.id,
      ConversationTypeEnum.PRIVATE
    );

    await openConversationWithMessages({ conversationKey: conversation.id, messageId: null });

    closeDialog();
  }

  useKey(
    'Enter',
    () => {
      void onClickStartConversation();
    },
    undefined,
    [props?.conversationId]
  );

  if (!props) {
    return null;
  }

  return (
    <HE4SWrapperModal
      title={props.userName}
      onClose={closeDialog}
      showExitIcon={true}
      additionalClassName="user-details-dialog"
    >
      <div className="avatar-center">
        <div className="avatar-center-inner">
          <Avatar
            size={size}
            onAvatarClick={() => {
              setIsEnlargedImageShown(!isEnlargedImageShown);
            }}
            pubkey={props.conversationId}
          />
        </div>
      </div>
      <SpacerLG />
      <Flex container={true} width={'100%'} justifyContent="center" alignItems="center">
        <HE4SInput
          value={props.conversationId}
          textSize="md"
          centerText={true}
          editable={false}
          monospaced={true}
          isTextArea={true}
        />
      </Flex>
      <SpacerLG />
      <div className="he4s-modal__button-group__center">
        <HE4SButton
          text={window.i18n('conversationsNew')}
          buttonType={HE4SButtonType.Simple}
          onClick={onClickStartConversation}
        />
        <CopyToClipboardButton
          copyContent={props.conversationId}
          buttonType={HE4SButtonType.Simple}
          hotkey={true}
        />
      </div>
    </HE4SWrapperModal>
  );
};
