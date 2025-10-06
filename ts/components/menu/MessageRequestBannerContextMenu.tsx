import { Menu } from 'react-contexify';
import { useDispatch } from 'react-redux';

import { HE4SContextMenuContainer } from '../HE4SContextMenuContainer';

import { hideMessageRequestBanner } from '../../state/ducks/userConfig';
import { ItemWithDataTestId } from './items/MenuItemWithDataTestId';
import { getMenuAnimation } from './MenuAnimation';

export type PropsContextConversationItem = {
  triggerId: string;
};

const HideBannerMenuItem = (): JSX.Element => {
  const dispatch = useDispatch();
  return (
    <ItemWithDataTestId
      onClick={() => {
        dispatch(hideMessageRequestBanner());
      }}
    >
      {window.i18n('hide')}
    </ItemWithDataTestId>
  );
};

export const MessageRequestBannerContextMenu = (props: PropsContextConversationItem) => {
  const { triggerId } = props;

  return (
    <HE4SContextMenuContainer>
      <Menu id={triggerId} animation={getMenuAnimation()}>
        <HideBannerMenuItem />
      </Menu>
    </HE4SContextMenuContainer>
  );
};
