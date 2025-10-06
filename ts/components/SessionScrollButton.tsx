import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getShowScrollButton } from '../state/selectors/conversations';

import { useSelectedUnreadCount } from '../state/selectors/selectedConversation';
import { HE4SIconButton } from './icon';
import { HE4SUnreadCount } from './icon/HE4SNotificationCount';

const HE4SScrollButtonDiv = styled.div`
  position: fixed;
  z-index: 2;
  right: 60px;
  animation: fadein var(--default-duration);

  .he4s-icon-button {
    background-color: var(--message-bubbles-received-background-color);
    box-shadow: var(--scroll-button-shadow);
  }
`;

export const HE4SScrollButton = (props: { onClickScrollBottom: () => void }) => {
  const show = useSelector(getShowScrollButton);
  const unreadCount = useSelectedUnreadCount();

  return (
    <HE4SScrollButtonDiv>
      <HE4SIconButton
        iconType="chevron"
        iconSize={'huge'}
        isHidden={!show}
        onClick={props.onClickScrollBottom}
        dataTestId="scroll-to-bottom-button"
      >
        {Boolean(unreadCount) && <HE4SUnreadCount count={unreadCount} />}
      </HE4SIconButton>
    </HE4SScrollButtonDiv>
  );
};
