import classNames from 'classnames';
import { ReactNode, RefObject } from 'react';
import styled from 'styled-components';

export enum HE4SButtonType {
  Outline = 'outline',
  Simple = 'simple',
  Solid = 'solid',
  Ghost = 'ghost',
}

export enum HE4SButtonShape {
  Round = 'round',
  Square = 'square',
  None = 'none',
}

// NOTE References ts/themes/colors.tsx
export enum HE4SButtonColor {
  Green = 'green',
  Blue = 'blue',
  Yellow = 'yellow',
  Pink = 'pink',
  Purple = 'purple',
  Orange = 'orange',
  Red = 'red',
  White = 'white',
  Primary = 'primary',
  Danger = 'danger',
  None = 'transparent',
}

const StyledButton = styled.button<{
  color: string | undefined;
  buttonType: HE4SButtonType;
  buttonShape: HE4SButtonShape;
}>`
  width: ${props => (props.buttonType === HE4SButtonType.Ghost ? '100%' : 'auto')};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: 700;
  user-select: none;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--default-duration);
  background-repeat: no-repeat;
  overflow: hidden;
  height: ${props => (props.buttonType === HE4SButtonType.Ghost ? undefined : '34px')};
  min-height: ${props => (props.buttonType === HE4SButtonType.Ghost ? undefined : '34px')};
  padding: ${props =>
    props.buttonType === HE4SButtonType.Ghost ? '18px 24px 22px' : '0px 18px'};
  background-color: ${props =>
    props.buttonType === HE4SButtonType.Solid && props.color
      ? `var(--${props.color}-color)`
      : `var(--button-${props.buttonType}-background-color)`};
  color: ${props =>
    props.color
      ? props.buttonType !== HE4SButtonType.Solid
        ? `var(--${props.color}-color)`
        : 'var(--white-color)'
      : `var(--button-${props.buttonType}-text-color)`};
  ${props =>
    props.buttonType === HE4SButtonType.Outline &&
    `outline: none; border: 1px solid ${
      props.color ? `var(--${props.color}-color)` : 'var(--button-outline-border-color)'
    }`};
  ${props =>
    props.buttonType === HE4SButtonType.Solid &&
    'box-shadow: 0px 0px 6px var(--button-solid-shadow-color);'}
  border-radius: ${props =>
    props.buttonShape === HE4SButtonShape.Round
      ? '17px'
      : props.buttonShape === HE4SButtonShape.Square
        ? '6px'
        : '0px'};

  .he4s-icon {
    fill: var(--background-primary-color);
  }

  & > *:hover:not(svg) {
    filter: brightness(80%);
  }

  &.disabled {
    cursor: not-allowed;
    outline: none;
    ${props =>
      props.buttonType === HE4SButtonType.Solid
        ? 'background-color: var(--button-solid-disabled-color)'
        : props.buttonType === HE4SButtonType.Outline
          ? 'border: 1px solid var(--button-outline-disabled-color)'
          : ''};
    color: ${props =>
      props.buttonType === HE4SButtonType.Solid
        ? 'var(--button-solid-text-color)'
        : `var(--button-${props.buttonType}-disabled-color)`};
  }

  &:not(.disabled) {
    &:hover {
      color: ${props => `var(--button-${props.buttonType}-text-hover-color)`};
      ${props =>
        props.buttonType &&
        `background-color: var(--button-${props.buttonType}-background-hover-color);`};
      ${props =>
        props.buttonType === HE4SButtonType.Outline &&
        'outline: none; border: 1px solid var(--button-outline-border-hover-color);'};
    }
  }
`;

export type HE4SButtonProps = {
  text?: string;
  ariaLabel?: string;
  disabled?: boolean;
  buttonType?: HE4SButtonType;
  buttonShape?: HE4SButtonShape;
  buttonColor?: HE4SButtonColor; // will override theme
  onClick?: any;
  children?: ReactNode;
  margin?: string;
  reference?: RefObject<HTMLButtonElement>;
  className?: string;
  dataTestId?: string;
};

export const HE4SButton = (props: HE4SButtonProps) => {
  const {
    buttonType = HE4SButtonType.Outline,
    buttonShape = buttonType === HE4SButtonType.Ghost
      ? HE4SButtonShape.None
      : HE4SButtonShape.Round,
    reference,
    className,
    dataTestId,
    buttonColor,
    text,
    ariaLabel,
    disabled = false,
    onClick = null,
    margin,
  } = props;

  const clickHandler = (e: any) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };
  const onClickFn = disabled ? () => null : clickHandler;

  return (
    <StyledButton
      aria-label={ariaLabel}
      color={buttonColor}
      buttonShape={buttonShape}
      buttonType={buttonType}
      className={classNames(
        'he4s-button',
        buttonShape,
        buttonType,
        buttonColor ?? '',
        disabled && 'disabled',
        className
      )}
      role="button"
      onClick={onClickFn}
      ref={reference}
      data-testid={dataTestId}
      style={{ margin }}
    >
      {props.children || text}
    </StyledButton>
  );
};
