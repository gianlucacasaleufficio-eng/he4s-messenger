import styled from 'styled-components';
import { UserUtils } from '../../he4s/utils';

const StyledPillDividerLine = styled.div`
  border-bottom: 1px solid var(--border-color);
  line-height: 0.1rem;
  flex-grow: 1;
  height: 1px;
  align-self: center;
`;

const StyledPillSpan = styled.span`
  padding: 6px 15px 5px;
  border-radius: 50px;
  color: var(--text-secondary-color);
  border: 1px solid var(--border-color);
`;

const StyledPillDivider = styled.div`
  width: 100%;
  text-align: center;
  display: flex;
  margin: 0;
`;

export const YourHE4SIDPill = () => {
  return (
    <StyledPillDivider>
      <StyledPillDividerLine />
      <StyledPillSpan>{window.i18n('accountIdYours')}</StyledPillSpan>
      <StyledPillDividerLine />
    </StyledPillDivider>
  );
};

const StyledYourHE4SIDSelectable = styled.p`
  user-select: none;
  text-align: center;
  word-break: break-all;
  font-weight: 300;
  font-size: var(--font-size-sm);
  color: var(--text-primary-color);
  flex-shrink: 0;
`;

export const YourHE4SIDSelectable = () => {
  const ourHE4SID = UserUtils.getOurPubKeyStrFromCache();
  return (
    <StyledYourHE4SIDSelectable data-testid="your-he4s-id">
      {ourHE4SID.slice(0, 33)}
      <br />
      {ourHE4SID.slice(33)}
    </StyledYourHE4SIDSelectable>
  );
};
