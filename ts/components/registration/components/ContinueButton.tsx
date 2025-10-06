import { HE4SButton, HE4SButtonColor } from '../../basic/HE4SButton';

type Props = {
  onClick: () => void | Promise<void>;
  disabled: boolean;
};

export const ContinueButton = (props: Props) => {
  const { onClick, disabled } = props;

  return (
    <HE4SButton
      ariaLabel={window.i18n('theContinue')}
      buttonColor={HE4SButtonColor.White}
      onClick={onClick}
      text={window.i18n('theContinue')}
      disabled={disabled}
      dataTestId="continue-button"
    />
  );
};
