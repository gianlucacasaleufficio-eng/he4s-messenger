import styled from 'styled-components';
import { HE4SIcon, HE4SIconSize, HE4SIconType } from '../icon';
import { PanelButton, PanelButtonProps, PanelButtonText, StyledContent } from './PanelButton';

interface PanelIconButton extends Omit<PanelButtonProps, 'children'> {
  text: string;
  iconType: HE4SIconType;
  iconSize?: HE4SIconSize;
  subtitle?: string;
  color?: string;
}

const IconContainer = styled.div`
  flex-shrink: 0;
  margin: 0 var(--margins-lg) 0 var(--margins-sm);
  padding: 0;
`;

export const PanelIconButton = (props: PanelIconButton) => {
  const {
    text,
    subtitle,
    iconType,
    iconSize,
    color,
    disabled = false,
    onClick,
    dataTestId,
  } = props;

  return (
    <PanelButton disabled={disabled} onClick={onClick} dataTestId={dataTestId}>
      <StyledContent disabled={disabled}>
        <IconContainer>
          <HE4SIcon iconType={iconType} iconColor={color} iconSize={iconSize || 'large'} />
        </IconContainer>
        <PanelButtonText text={text} subtitle={subtitle} color={color} />
      </StyledContent>
    </PanelButton>
  );
};
