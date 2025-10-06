import classNames from 'classnames';
import { HE4SIcon, HE4SIconType } from '../icon';

export enum HE4SDropDownItemType {
  Default = 'default',
  Danger = 'danger',
}

type Props = {
  content: string;
  type: HE4SDropDownItemType;
  icon: HE4SIconType | null;
  active: boolean;
  onClick: any;
  dataTestId?: string;
};

export const HE4SDropdownItem = (props: Props) => {
  const clickHandler = (e: any) => {
    if (props.onClick) {
      e.stopPropagation();
      props.onClick();
    }
  };

  const { content, type, icon, active, dataTestId } = props;

  return (
    <div
      className={classNames(
        'he4s-dropdown__item',
        active ? 'active' : '',
        type || HE4SDropDownItemType.Default
      )}
      role="button"
      onClick={clickHandler}
      data-testid={dataTestId}
    >
      {icon ? <HE4SIcon iconType={icon} iconSize="small" /> : ''}
      <div className="item-content">{content}</div>
    </div>
  );
};
