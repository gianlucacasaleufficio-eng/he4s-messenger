import { shell } from 'electron';
import { isEmpty } from 'lodash';
import { Dispatch } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { MessageInteraction } from '../../interactions';
import { OpenUrlModalState, updateOpenUrlModal } from '../../state/ducks/modalDialog';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerMD } from '../basic/Text';
import { StyledI18nSubText } from '../basic/StyledI18nSubText';
import { StyledModalDescriptionContainer } from './shared/ModalDescriptionContainer';

const StyledScrollDescriptionContainer = styled(StyledModalDescriptionContainer)`
  max-height: 110px;
  overflow-y: auto;
`;

export function OpenUrlModal(props: OpenUrlModalState) {
  const dispatch = useDispatch();

  if (!props || isEmpty(props) || !props.urlToOpen) {
    return null;
  }
  const url = props.urlToOpen;

  function onClose() {
    dispatch(updateOpenUrlModal(null));
  }

  function onClickOpen() {
    void shell.openExternal(url);
    onClose();
  }

  function onClickCopy() {
    MessageInteraction.copyBodyToClipboard(url);
    onClose();
  }

  return (
    <HE4SWrapperModal
      title={window.i18n('urlOpen')}
      onClose={onClose}
      showExitIcon={true}
      showHeader={true}
    >
      <div className="he4s-modal__centered">
        <StyledScrollDescriptionContainer>
          <StyledI18nSubText token="urlOpenDescription" asTag="span" args={{ url }} />
        </StyledScrollDescriptionContainer>
      </div>
      <SpacerMD />
      <div className="he4s-modal__button-group">
        <HE4SButton
          text={window.i18n('open')}
          buttonColor={HE4SButtonColor.Danger}
          buttonType={HE4SButtonType.Simple}
          onClick={onClickOpen}
          dataTestId="he4s-confirm-ok-button"
        />
        <HE4SButton
          text={window.i18n('urlCopy')}
          buttonType={HE4SButtonType.Simple}
          onClick={onClickCopy}
          dataTestId="he4s-confirm-cancel-button"
        />
      </div>
    </HE4SWrapperModal>
  );
}

export const showLinkVisitWarningDialog = (urlToOpen: string, dispatch: Dispatch<any>) => {
  dispatch(
    updateOpenUrlModal({
      urlToOpen,
    })
  );
};
