import classNames from 'classnames';
import { ReactNode, useRef } from 'react';
import useKey from 'react-use/lib/useKey';

import styled from 'styled-components';
import { HE4SIconButton } from './icon';

import { HE4SFocusTrap } from './HE4SFocusTrap';
import { Flex } from './basic/Flex';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from './basic/HE4SButton';
import { SpacerXL } from './basic/Text';

const StyledTitle = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 0 var(--margins-sm);
`;

export type HE4SWrapperModalType = {
  title?: string;
  showHeader?: boolean;
  onConfirm?: () => void;
  onClose?: (event?: KeyboardEvent) => void;
  showClose?: boolean;
  confirmText?: string;
  cancelText?: string;
  showExitIcon?: boolean;
  headerIconButtons?: Array<any>;
  children: ReactNode;
  headerReverse?: boolean;
  additionalClassName?: string;
};

export const HE4SWrapperModal = (props: HE4SWrapperModalType) => {
  const {
    title,
    onConfirm,
    onClose,
    showHeader = true,
    showClose = false,
    confirmText,
    cancelText,
    showExitIcon,
    headerIconButtons,
    headerReverse,
    additionalClassName,
  } = props;

  useKey(
    'Esc',
    event => {
      props.onClose?.(event);
    },
    undefined,
    [props.onClose]
  );

  useKey(
    'Escape',
    event => {
      props.onClose?.(event);
    },
    undefined,
    [props.onClose]
  );

  const modalRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: any) => {
    if (!modalRef.current?.contains(e.target)) {
      props.onClose?.();
    }
  };

  return (
    <HE4SFocusTrap>
      <div
        className={classNames('loki-dialog modal', additionalClassName || null)}
        onClick={handleClick}
        role="dialog"
      >
        <div className="he4s-confirm-wrapper">
          <div ref={modalRef} className="he4s-modal">
            {showHeader ? (
              <Flex
                container={true}
                flexDirection={headerReverse ? 'row-reverse' : 'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                padding={'var(--margins-lg)'}
                className={'he4s-modal__header'}
              >
                <Flex
                  container={true}
                  flexDirection={headerReverse ? 'row-reverse' : 'row'}
                  alignItems={'center'}
                  padding={'0'}
                  margin={'0'}
                  className={'he4s-modal__header__close'}
                >
                  {showExitIcon ? (
                    <HE4SIconButton
                      iconType="exit"
                      iconSize="small"
                      onClick={() => {
                        props.onClose?.();
                      }}
                      padding={'5px'}
                      margin={'0'}
                      dataTestId="modal-close-button"
                    />
                  ) : null}
                  {headerIconButtons?.length
                    ? headerIconButtons.map((_, index) => {
                        const offset = showExitIcon
                          ? headerIconButtons.length - 2
                          : headerIconButtons.length - 1;
                        if (index > offset) {
                          return null;
                        }
                        return <SpacerXL key={`he4s-modal__header_space-${index}`} />;
                      })
                    : null}
                </Flex>
                <StyledTitle className="he4s-modal__header__title">{title}</StyledTitle>
                <Flex
                  container={true}
                  flexDirection={headerReverse ? 'row-reverse' : 'row'}
                  alignItems={'center'}
                  padding={'0'}
                  margin={'0'}
                >
                  {headerIconButtons?.length ? (
                    headerIconButtons.map((iconItem: any) => {
                      return (
                        <HE4SIconButton
                          key={iconItem.iconType}
                          iconType={iconItem.iconType}
                          iconSize={'large'}
                          iconRotation={iconItem.iconRotation}
                          onClick={iconItem.onClick}
                          padding={'0'}
                          margin={'0'}
                        />
                      );
                    })
                  ) : showExitIcon ? (
                    <SpacerXL />
                  ) : null}
                </Flex>
              </Flex>
            ) : null}

            <div className="he4s-modal__body">
              <div className="he4s-modal__centered">
                {props.children}

                <div className="he4s-modal__button-group">
                  {onConfirm ? (
                    <HE4SButton buttonType={HE4SButtonType.Simple} onClick={props.onConfirm}>
                      {confirmText || window.i18n('okay')}
                    </HE4SButton>
                  ) : null}
                  {onClose && showClose ? (
                    <HE4SButton
                      buttonType={HE4SButtonType.Simple}
                      buttonColor={HE4SButtonColor.Danger}
                      onClick={props.onClose}
                    >
                      {cancelText || window.i18n('close')}
                    </HE4SButton>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HE4SFocusTrap>
  );
};
