import { useState } from 'react';
import { HE4SIcon, HE4SIconType } from '../icon';

import { HE4SDropdownItem, HE4SDropDownItemType } from './HE4SDropdownItem';

// THIS IS DROPDOWN ACCORDION STYLE OPTIONS SELECTOR ELEMENT, NOT A CONTEXTMENU

type Props = {
  label: string;
  onClick?: any;
  expanded?: boolean;
  options: Array<{
    content: string;
    id?: string;
    icon?: HE4SIconType | null;
    type?: HE4SDropDownItemType;
    active?: boolean;
    onClick?: any;
  }>;
  dataTestId?: string;
};

export const HE4SDropdown = (props: Props) => {
  const { label, options, dataTestId } = props;
  const [expanded, setExpanded] = useState(!!props.expanded);
  const chevronOrientation = expanded ? 180 : 0;

  return (
    <div className="he4s-dropdown" data-testid={dataTestId}>
      <div
        className="he4s-dropdown__label"
        onClick={() => {
          setExpanded(!expanded);
        }}
        role="button"
      >
        {label}
        <HE4SIcon iconType="chevron" iconSize="small" iconRotation={chevronOrientation} />
      </div>

      {expanded && (
        <div className="he4s-dropdown__list-container">
          {options.map((item: any) => {
            return (
              <HE4SDropdownItem
                key={item.content}
                dataTestId={`dropdownitem-${item.content.replace(' ', '-')}`}
                content={item.content}
                icon={item.icon}
                type={item.type}
                active={item.active}
                onClick={() => {
                  setExpanded(false);
                  item.onClick();
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
