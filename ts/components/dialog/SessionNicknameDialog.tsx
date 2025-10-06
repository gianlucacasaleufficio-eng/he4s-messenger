import _ from 'lodash';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';
import { getConversationController } from '../../he4s/conversations';

import { changeNickNameModal } from '../../state/ducks/modalDialog';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerLG } from '../basic/Text';
import { useConversationRealName } from '../../hooks/useParamSelector';
import { PubKey } from '../../he4s/types';
import { Localizer } from '../basic/Localizer';

type Props = {
  conversationId: string;
};

const StyledMaxWidth = styled.span`
  max-width: 30ch;
`;

export const HE4SNicknameDialog = (props: Props) => {
  const { conversationId } = props;
  const [nickname, setNickname] = useState('');
  // this resolves to the real user name, and not the nickname (if set) like we do usually
  const displayName = useConversationRealName(conversationId);

  const dispatch = useDispatch();

  /**
   * Changes the state of nickname variable. If enter is pressed, saves the current
   * entered nickname value as the nickname.
   */
  const onNicknameInput = async (event: any) => {
    if (event.key === 'Enter') {
      await saveNickname();
    } else {
      const currentNicknameEntered = event.target.value;
      setNickname(currentNicknameEntered);
    }
  };

  const onClickClose = () => {
    dispatch(changeNickNameModal(null));
  };

  /**
   * Saves the currently entered nickname.
   */
  const saveNickname = async () => {
    if (!conversationId) {
      throw new Error('Cant save without conversation id');
    }
    const conversation = getConversationController().get(conversationId);
    await conversation.setNickname(nickname, true);
    onClickClose();
  };

  return (
    <HE4SWrapperModal
      title={window.i18n('nicknameSet')}
      onClose={onClickClose}
      showExitIcon={false}
      showHeader={true}
    >
      <StyledMaxWidth className="he4s-modal__centered">
        <Localizer
          token="nicknameDescription"
          args={{
            name: displayName || PubKey.shorten(conversationId),
          }}
        />
        <SpacerLG />
      </StyledMaxWidth>

      <input
        autoFocus={true}
        type="nickname"
        id="nickname-modal-input"
        placeholder={window.i18n('nicknameEnter')}
        onKeyUp={e => {
          void onNicknameInput(_.cloneDeep(e));
        }}
        data-testid="nickname-input"
      />

      <div className="he4s-modal__button-group">
        <HE4SButton
          text={window.i18n('save')}
          buttonType={HE4SButtonType.Simple}
          onClick={saveNickname}
          dataTestId="confirm-nickname"
        />
        <HE4SButton
          text={window.i18n('cancel')}
          buttonColor={HE4SButtonColor.Danger}
          buttonType={HE4SButtonType.Simple}
          onClick={onClickClose}
        />
      </div>
    </HE4SWrapperModal>
  );
};
