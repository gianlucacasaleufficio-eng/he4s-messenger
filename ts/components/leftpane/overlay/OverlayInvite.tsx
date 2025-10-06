import useKey from 'react-use/lib/useKey';
import styled from 'styled-components';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetLeftOverlayMode } from '../../../state/ducks/section';

import { UserUtils } from '../../../he4s/utils';
import { Flex } from '../../basic/Flex';
import { SpacerLG, SpacerMD, SpacerSM } from '../../basic/Text';
import { HelpDeskButton } from '../../buttons';
import { CopyToClipboardButton } from '../../buttons/CopyToClipboardButton';
import { HE4SIcon } from '../../icon';
import { HE4SInput } from '../../inputs';
import { StyledLeftPaneOverlay } from './OverlayMessage';
import { StyledTextAreaContainer } from '../../inputs/HE4SInput';

const StyledHeadingContainer = styled(Flex)`
  .he4s-icon-button {
    border: 1px solid var(--text-primary-color);
    border-radius: 9999px;
    margin-inline-start: var(--margins-sm);
    transition-duration: var(--default-duration);
  }
`;

const StyledHeading = styled.h3`
  color: var(--text-primary-color);
  font-family: var(--font-default);
  font-size: var(--font-size-sm);
  font-weight: 300;
  margin: 0 auto;
  padding: 0;
`;

const StyledDescription = styled.div`
  color: var(--text-secondary-color);
  font-family: var(--font-default);
  font-style: normal;
  font-weight: 300;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  margin: 0 auto;
  text-align: center;
  padding: 0 var(--margins-sm);
`;

const StyledButtonerContainer = styled.div`
  .he4s-button {
    width: 160px;
    height: 41px;
  }
`;

const StyledInputContainer = styled(Flex)`
  ${StyledTextAreaContainer} {
    padding: 0;

    div:first-child {
      padding: 0 var(--margins-sm);
    }
  }
`;

export const OverlayInvite = () => {
  const ourHE4SID = UserUtils.getOurPubKeyStrFromCache();

  const [idCopied, setIdCopied] = useState(false);

  const dispatch = useDispatch();

  function closeOverlay() {
    dispatch(resetLeftOverlayMode());
  }

  useKey('Escape', closeOverlay);

  return (
    <StyledLeftPaneOverlay
      container={true}
      flexDirection={'column'}
      flexGrow={1}
      alignItems={'center'}
      padding={'var(--margins-md)'}
    >
      {!idCopied ? (
        <>
          <StyledInputContainer
            container={true}
            width={'100%'}
            justifyContent="center"
            alignItems="center"
          >
            <HE4SInput
              type="text"
              value={ourHE4SID}
              editable={false}
              centerText={true}
              isTextArea={true}
              ariaLabel="Account ID"
              inputDataTestId="your-account-id"
            />
          </StyledInputContainer>
          <SpacerMD />
          <StyledDescription>{window.i18n('accountIdCopyDescription')}</StyledDescription>
          <SpacerLG />
          <StyledButtonerContainer>
            <CopyToClipboardButton
              copyContent={ourHE4SID}
              onCopyComplete={() => setIdCopied(true)}
              hotkey={true}
              dataTestId="copy-button-account-id"
            />
          </StyledButtonerContainer>
        </>
      ) : (
        <>
          <HE4SIcon
            iconType={'checkCircle'}
            iconSize={'huge2'}
            iconColor={'var(--primary-color)'}
          />
          <SpacerMD />
          <StyledHeadingContainer container={true} justifyContent="center" alignItems="center">
            <StyledHeading>{window.i18n('accountIdCopied')}</StyledHeading>
            <HelpDeskButton
              iconColor={'var(--text-primary-color)'}
              style={{ display: 'inline-flex' }}
            />
          </StyledHeadingContainer>
          <SpacerSM />
          <StyledDescription>{window.i18n('shareAccountIdDescriptionCopied')}</StyledDescription>
        </>
      )}
    </StyledLeftPaneOverlay>
  );
};
