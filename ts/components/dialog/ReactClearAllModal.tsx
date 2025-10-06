import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { useMessageReactsPropsById } from '../../hooks/useParamSelector';
import { clearSogsReactionByServerId } from '../../he4s/apis/open_group_api/sogsv3/sogsV3ClearReaction';
import { getConversationController } from '../../he4s/conversations';
import { updateReactClearAllModal } from '../../state/ducks/modalDialog';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Flex } from '../basic/Flex';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { HE4SSpinner } from '../loading';

type Props = {
  reaction: string;
  messageId: string;
};

const StyledButtonContainer = styled.div`
  div:first-child {
    margin-right: 0px;
  }
  div:not(:first-child) {
    margin-left: 20px;
  }
`;

const StyledReactClearAllContainer = styled(Flex)`
  margin: var(--margins-lg);

  .he4s-button {
    font-size: 16px;
    height: 36px;
    padding-top: 3px;
  }
`;

const StyledDescription = styled.div`
  font-size: var(--font-size-md);
  font-weight: 400;
  padding-bottom: var(--margins-lg);
  margin: var(--margins-md) auto;
`;

export const ReactClearAllModal = (props: Props) => {
  const { reaction, messageId } = props;

  const [clearingInProgress, setClearingInProgress] = useState(false);

  const dispatch = useDispatch();
  const msgProps = useMessageReactsPropsById(messageId);

  if (!msgProps) {
    return <></>;
  }

  const { convoId, serverId } = msgProps;
  const roomInfos = getConversationController().get(convoId).toOpenGroupV2();

  const handleClose = () => {
    dispatch(updateReactClearAllModal(null));
  };

  const handleClearAll = async () => {
    if (roomInfos && serverId) {
      setClearingInProgress(true);
      await clearSogsReactionByServerId(reaction, serverId, roomInfos);
      setClearingInProgress(false);
      handleClose();
    } else {
      window.log.warn('Error for batch removal of', reaction, 'on message', messageId);
    }
  };

  return (
    <HE4SWrapperModal
      additionalClassName={'reaction-list-modal'}
      showHeader={false}
      onClose={handleClose}
    >
      <StyledReactClearAllContainer container={true} flexDirection={'column'} alignItems="center">
        <StyledDescription>
          {window.i18n('emojiReactsClearAll', { emoji: reaction })}
        </StyledDescription>
        <StyledButtonContainer className="he4s-modal__button-group">
          <HE4SButton
            text={window.i18n('clear')}
            buttonColor={HE4SButtonColor.Danger}
            buttonType={HE4SButtonType.Simple}
            onClick={handleClearAll}
            disabled={clearingInProgress}
          />
          <HE4SButton
            text={window.i18n('cancel')}
            buttonType={HE4SButtonType.Simple}
            onClick={handleClose}
            disabled={clearingInProgress}
          />
        </StyledButtonContainer>
        <HE4SSpinner loading={clearingInProgress} />
      </StyledReactClearAllContainer>
    </HE4SWrapperModal>
  );
};
