import { forwardRef } from 'react';
import styled from 'styled-components';
import { useIsOutgoingRequest } from '../../../hooks/useParamSelector';
import { useSelectedConversationKey } from '../../../state/selectors/selectedConversation';
import { HE4SIconButton } from '../../icon';

const StyledChatButtonContainer = styled.div<{ disabled?: boolean }>`
  .he4s-icon-button {
    svg {
      background-color: var(--chat-buttons-background-color);
    }

    ${props =>
      !props.disabled &&
      `&:hover svg {
      background-color: var(--chat-buttons-background-hover-color);
    }`}
  }
`;

export const AddStagedAttachmentButton = (props: { onClick: () => void }) => {
  const selectedConvoKey = useSelectedConversationKey();
  const isOutgoingRequest = useIsOutgoingRequest(selectedConvoKey);

  return (
    <StyledChatButtonContainer disabled={isOutgoingRequest}>
      <HE4SIconButton
        iconType="plusThin"
        backgroundColor={'var(--chat-buttons-background-color)'}
        iconColor={'var(--chat-buttons-icon-color)'}
        iconSize={'huge2'}
        borderRadius="300px"
        iconPadding="8px"
        onClick={props.onClick}
        dataTestId="attachments-button"
        disabled={isOutgoingRequest}
      />
    </StyledChatButtonContainer>
  );
};

export const StartRecordingButton = (props: { onClick: () => void }) => {
  const selectedConvoKey = useSelectedConversationKey();
  const isOutgoingRequest = useIsOutgoingRequest(selectedConvoKey);

  return (
    <StyledChatButtonContainer disabled={isOutgoingRequest}>
      <HE4SIconButton
        iconType="microphone"
        iconSize={'huge2'}
        backgroundColor={'var(--chat-buttons-background-color)'}
        iconColor={'var(--chat-buttons-icon-color)'}
        borderRadius="300px"
        iconPadding="6px"
        onClick={props.onClick}
        disabled={isOutgoingRequest}
        dataTestId="microphone-button"
      />
    </StyledChatButtonContainer>
  );
};

// eslint-disable-next-line react/display-name
export const ToggleEmojiButton = forwardRef<HTMLButtonElement, { onClick: () => void }>(
  (props, ref) => {
    return (
      <StyledChatButtonContainer>
        <HE4SIconButton
          iconType="emoji"
          ref={ref}
          backgroundColor={'var(--chat-buttons-background-color)'}
          iconColor={'var(--chat-buttons-icon-color)'}
          iconSize={'huge2'}
          borderRadius="300px"
          iconPadding="6px"
          onClick={props.onClick}
          dataTestId="emoji-button"
        />
      </StyledChatButtonContainer>
    );
  }
);

export const SendMessageButton = (props: { onClick: () => void }) => {
  return (
    <StyledChatButtonContainer>
      <HE4SIconButton
        iconType="send"
        backgroundColor={'var(--chat-buttons-background-color)'}
        iconColor={'var(--chat-buttons-icon-color)'}
        iconSize={'huge2'}
        iconRotation={90}
        borderRadius="300px"
        iconPadding="6px"
        onClick={props.onClick}
        dataTestId="send-message-button"
      />
    </StyledChatButtonContainer>
  );
};
