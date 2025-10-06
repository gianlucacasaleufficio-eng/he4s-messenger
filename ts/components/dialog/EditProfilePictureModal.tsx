import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { clearOurAvatar, uploadOurAvatar } from '../../interactions/conversationInteractions';
import { ToastUtils } from '../../he4s/utils';
import { editProfileModal, updateEditProfilePictureModal } from '../../state/ducks/modalDialog';
import type { EditProfilePictureModalProps } from '../../types/ReduxTypes';
import { pickFileForAvatar } from '../../types/attachments/VisualAttachment';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerLG } from '../basic/Text';
import { HE4SIconButton } from '../icon';
import { HE4SSpinner } from '../loading';
import { ProfileAvatar } from './edit-profile/components';

const StyledAvatarContainer = styled.div`
  cursor: pointer;
`;

const StyledUploadButton = styled.div`
  background-color: var(--chat-buttons-background-color);
  border-radius: 50%;
  overflow: hidden;
`;

const UploadImageButton = () => {
  return (
    <div style={{ position: 'relative' }}>
      <StyledUploadButton>
        <HE4SIconButton iconType="thumbnail" iconSize={80} iconPadding="16px" />
      </StyledUploadButton>
      <HE4SIconButton
        iconType="plusFat"
        iconSize={23}
        iconColor="var(--modal-background-content-color)"
        iconPadding="5px"
        borderRadius="50%"
        backgroundColor="var(--primary-color)"
        style={{ position: 'absolute', bottom: 0, right: 0 }}
      />
    </div>
  );
};

const uploadProfileAvatar = async (scaledAvatarUrl: string | null) => {
  if (scaledAvatarUrl?.length) {
    try {
      const blobContent = await (await fetch(scaledAvatarUrl)).blob();
      if (!blobContent || !blobContent.size) {
        throw new Error('Failed to fetch blob content from scaled avatar');
      }
      await uploadOurAvatar(await blobContent.arrayBuffer());
    } catch (error) {
      if (error.message && error.message.length) {
        ToastUtils.pushToastError('edit-profile', error.message);
      }
      window.log.error(
        'showEditProfileDialog Error ensuring that image is properly sized:',
        error && error.stack ? error.stack : error
      );
    }
  }
};

export const EditProfilePictureModal = (props: EditProfilePictureModalProps) => {
  const dispatch = useDispatch();

  const [newAvatarObjectUrl, setNewAvatarObjectUrl] = useState<string | null>(props.avatarPath);
  const [loading, setLoading] = useState(false);

  if (!props) {
    return null;
  }

  const { avatarPath, profileName, ourId } = props;

  const closeDialog = () => {
    dispatch(updateEditProfilePictureModal(null));
    dispatch(editProfileModal({}));
  };

  const handleAvatarClick = async () => {
    const updatedAvatarObjectUrl = await pickFileForAvatar();
    if (updatedAvatarObjectUrl) {
      setNewAvatarObjectUrl(updatedAvatarObjectUrl);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    if (newAvatarObjectUrl === avatarPath) {
      window.log.debug('Avatar Object URL has not changed!');
      return;
    }

    await uploadProfileAvatar(newAvatarObjectUrl);
    setLoading(false);
    dispatch(updateEditProfilePictureModal(null));
  };

  const handleRemove = async () => {
    setLoading(true);
    await clearOurAvatar();
    setNewAvatarObjectUrl(null);
    setLoading(false);
    dispatch(updateEditProfilePictureModal(null));
  };

  return (
    <HE4SWrapperModal
      title={window.i18n('profileDisplayPictureSet')}
      onClose={closeDialog}
      showHeader={true}
      headerReverse={true}
      showExitIcon={true}
    >
      <div
        className="avatar-center"
        role="button"
        onClick={() => void handleAvatarClick()}
        data-testid={'image-upload-click'}
      >
        <StyledAvatarContainer className="avatar-center-inner">
          {newAvatarObjectUrl || avatarPath ? (
            <ProfileAvatar
              newAvatarObjectUrl={newAvatarObjectUrl}
              avatarPath={avatarPath}
              profileName={profileName}
              ourId={ourId}
            />
          ) : (
            <UploadImageButton />
          )}
        </StyledAvatarContainer>
      </div>

      {loading ? (
        <HE4SSpinner loading={loading} />
      ) : (
        <>
          <SpacerLG />
          <div className="he4s-modal__button-group">
            <HE4SButton
              text={window.i18n('save')}
              buttonType={HE4SButtonType.Simple}
              onClick={handleUpload}
              disabled={newAvatarObjectUrl === avatarPath}
              dataTestId="save-button-profile-update"
            />
            <HE4SButton
              text={window.i18n('remove')}
              buttonColor={HE4SButtonColor.Danger}
              buttonType={HE4SButtonType.Simple}
              onClick={handleRemove}
              disabled={!avatarPath}
            />
          </div>
        </>
      )}
    </HE4SWrapperModal>
  );
};
