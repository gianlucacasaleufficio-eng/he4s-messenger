/* eslint-disable @typescript-eslint/no-misused-promises */
import autoBind from 'auto-bind';

import { motion } from 'framer-motion';
import { Component } from 'react';
import styled from 'styled-components';
import { ConversationModel } from '../../models/conversation';
import { getConversationController } from '../../he4s/conversations';
import { initiateClosedGroupUpdate } from '../../he4s/group/closed-group';
import { initiateOpenGroupUpdate } from '../../he4s/group/open-group';
import { updateGroupNameModal } from '../../state/ducks/modalDialog';
import { THEME_GLOBALS } from '../../themes/globals';
import { pickFileForAvatar } from '../../types/attachments/VisualAttachment';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { Avatar, AvatarSize } from '../avatar/Avatar';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerMD } from '../basic/Text';
import LIBSESSION_CONSTANTS from '../../he4s/utils/libhe4s/libhe4s_constants';

const StyledErrorMessage = styled(motion.p)`
  text-align: center;
  color: var(--danger-color);
  display: block;
  user-select: none;
`;

type Props = {
  conversationId: string;
};

interface State {
  groupName: string | undefined;
  errorDisplayed: boolean;
  errorMessage: string;
  oldAvatarPath: string | null;
  newAvatarObjecturl: string | null;
}

export class UpdateGroupNameDialog extends Component<Props, State> {
  private readonly convo: ConversationModel;

  constructor(props: Props) {
    super(props);

    autoBind(this);
    this.convo = getConversationController().get(props.conversationId);

    this.state = {
      groupName: this.convo.getRealHE4SUsername(),
      errorDisplayed: false,
      errorMessage: 'placeholder',
      oldAvatarPath: this.convo.getAvatarPath(),
      newAvatarObjecturl: null,
    };
  }

  public componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
  }

  public componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
  }

  public onClickOK() {
    const { groupName, newAvatarObjecturl, oldAvatarPath } = this.state;
    const trimmedGroupName = groupName?.trim();
    if (!trimmedGroupName) {
      this.onShowError(window.i18n('groupNameEnterPlease'));

      return;
    }

    if (trimmedGroupName.length > LIBSESSION_CONSTANTS.BASE_GROUP_MAX_NAME_LENGTH) {
      this.onShowError(window.i18n('groupNameEnterShorter'));

      return;
    }

    if (
      trimmedGroupName !== this.convo.getRealHE4SUsername() ||
      newAvatarObjecturl !== oldAvatarPath
    ) {
      if (this.convo.isPublic()) {
        void initiateOpenGroupUpdate(this.convo.id, trimmedGroupName, {
          objectUrl: newAvatarObjecturl,
        });
      } else {
        const members = this.convo.get('members') || [];

        void initiateClosedGroupUpdate(this.convo.id, trimmedGroupName, members);
      }
    }

    this.closeDialog();
  }

  public render() {
    const okText = window.i18n('okay');
    const cancelText = window.i18n('cancel');

    const errorMsg = this.state.errorMessage;
    const isAdmin = !this.convo.isPublic();

    return (
      <HE4SWrapperModal
        title={window.i18n('groupName')}
        onClose={() => this.closeDialog()}
        additionalClassName="update-group-dialog"
      >
        {this.state.errorDisplayed ? (
          <>
            <SpacerMD />
            <StyledErrorMessage
              initial={{ opacity: 0 }}
              animate={{ opacity: this.state.errorDisplayed ? 1 : 0 }}
              transition={{ duration: THEME_GLOBALS['--duration-modal-error-shown'] }}
              style={{ marginTop: this.state.errorDisplayed ? '0' : '-5px' }}
            >
              {errorMsg}
            </StyledErrorMessage>
            <SpacerMD />
          </>
        ) : null}

        {this.renderAvatar()}
        <SpacerMD />

        {isAdmin ? (
          <input
            type="text"
            value={this.state.groupName}
            placeholder={window.i18n('groupNameEnter')}
            onChange={this.onGroupNameChanged}
            tabIndex={0}
            required={true}
            aria-required={true}
            autoFocus={true}
            maxLength={LIBSESSION_CONSTANTS.BASE_GROUP_MAX_NAME_LENGTH}
            data-testid="group-name-input"
          />
        ) : null}

        <div className="he4s-modal__button-group">
          <HE4SButton
            text={okText}
            onClick={this.onClickOK}
            buttonType={HE4SButtonType.Simple}
          />
          <HE4SButton
            text={cancelText}
            buttonColor={HE4SButtonColor.Danger}
            buttonType={HE4SButtonType.Simple}
            onClick={this.closeDialog}
          />
        </div>
      </HE4SWrapperModal>
    );
  }

  private onShowError(msg: string) {
    if (this.state.errorDisplayed) {
      return;
    }

    this.setState({
      errorDisplayed: true,
      errorMessage: msg,
    });

    setTimeout(() => {
      this.setState({
        errorDisplayed: false,
      });
    }, 3000);
  }

  private onKeyUp(event: any) {
    switch (event.key) {
      case 'Enter':
        this.onClickOK();
        break;
      case 'Esc':
      case 'Escape':
        this.closeDialog();
        break;
      default:
    }
  }

  private closeDialog() {
    window.removeEventListener('keyup', this.onKeyUp);

    window.inboxStore?.dispatch(updateGroupNameModal(null));
  }

  private onGroupNameChanged(event: any) {
    const groupName = event.target.value;
    this.setState(state => {
      return {
        ...state,
        groupName,
      };
    });
  }

  private renderAvatar() {
    const isPublic = this.convo.isPublic();
    const pubkey = this.convo.id;

    const { newAvatarObjecturl, oldAvatarPath } = this.state;

    if (!isPublic) {
      return undefined;
    }

    return (
      <div className="avatar-center">
        <div className="avatar-center-inner">
          <Avatar
            forcedAvatarPath={newAvatarObjecturl || oldAvatarPath}
            size={AvatarSize.XL}
            pubkey={pubkey}
          />
          <div className="image-upload-section" role="button" onClick={this.fireInputEvent} />
        </div>
      </div>
    );
  }

  private async fireInputEvent() {
    const scaledObjectUrl = await pickFileForAvatar();
    if (scaledObjectUrl) {
      this.setState({ newAvatarObjecturl: scaledObjectUrl });
    }
  }
}
