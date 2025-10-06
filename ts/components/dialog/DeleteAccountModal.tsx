import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { updateDeleteAccountModal } from '../../state/ducks/modalDialog';
import { HE4SWrapperModal } from '../HE4SWrapperModal';
import { HE4SButton, HE4SButtonColor, HE4SButtonType } from '../basic/HE4SButton';
import { SpacerLG } from '../basic/Text';
import { HE4SSpinner } from '../loading';

import {
  deleteEverythingAndNetworkData,
  sendConfigMessageAndDeleteEverything,
} from '../../util/accountManager';
import { HE4SRadioGroup } from '../basic/HE4SRadioGroup';
import { Localizer } from '../basic/Localizer';

const DEVICE_ONLY = 'device_only';
const DEVICE_AND_NETWORK = 'device_and_network';
type DeleteModes = typeof DEVICE_ONLY | typeof DEVICE_AND_NETWORK;

const DescriptionBeforeAskingConfirmation = (props: {
  deleteMode: DeleteModes;
  setDeleteMode: (deleteMode: DeleteModes) => void;
}) => {
  const { deleteMode, setDeleteMode } = props;
  return (
    <>
      <span className="he4s-confirm-main-message">
        <Localizer token="clearDataAllDescription" />
      </span>

      <SpacerLG />
      <HE4SRadioGroup
        group="delete_account"
        initialItem={deleteMode}
        onClick={value => {
          if (value === DEVICE_ONLY || value === DEVICE_AND_NETWORK) {
            setDeleteMode(value);
          }
        }}
        items={[
          { label: window.i18n('clearDeviceOnly'), value: DEVICE_ONLY },
          { label: window.i18n('clearDeviceAndNetwork'), value: 'device_and_network' },
        ]}
      />
    </>
  );
};

const DescriptionWhenAskingConfirmation = (props: { deleteMode: DeleteModes }) => {
  return (
    <span className="he4s-confirm-main-message">
      {props.deleteMode === 'device_and_network'
        ? window.i18n('clearDeviceAndNetworkConfirm')
        : window.i18n('clearDeviceDescription')}
    </span>
  );
};

export const DeleteAccountModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [askingConfirmation, setAskingConfirmation] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteModes>(DEVICE_ONLY);

  const dispatch = useDispatch();

  const onDeleteEverythingLocallyOnly = async () => {
    if (!isLoading) {
      setIsLoading(true);
      try {
        window.log.warn('Deleting everything on device but keeping network data');

        await sendConfigMessageAndDeleteEverything();
      } catch (e) {
        window.log.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onDeleteEverythingAndNetworkData = async () => {
    if (!isLoading) {
      setIsLoading(true);
      try {
        window.log.warn('Deleting everything including network data');
        await deleteEverythingAndNetworkData();
      } catch (e) {
        window.log.warn(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Performs specified on close action then removes the modal.
   */
  const onClickCancelHandler = useCallback(() => {
    dispatch(updateDeleteAccountModal(null));
  }, [dispatch]);

  return (
    <HE4SWrapperModal
      title={window.i18n('clearDataAll')}
      onClose={onClickCancelHandler}
      showExitIcon={true}
    >
      {askingConfirmation ? (
        <DescriptionWhenAskingConfirmation deleteMode={deleteMode} />
      ) : (
        <DescriptionBeforeAskingConfirmation
          deleteMode={deleteMode}
          setDeleteMode={setDeleteMode}
        />
      )}
      <div className="he4s-modal__centered">
        <div className="he4s-modal__button-group">
          <HE4SButton
            text={window.i18n('clear')}
            buttonColor={HE4SButtonColor.Danger}
            buttonType={HE4SButtonType.Simple}
            onClick={() => {
              if (!askingConfirmation) {
                setAskingConfirmation(true);
                return;
              }
              if (deleteMode === 'device_only') {
                void onDeleteEverythingLocallyOnly();
              } else if (deleteMode === 'device_and_network') {
                void onDeleteEverythingAndNetworkData();
              }
            }}
            disabled={isLoading}
          />

          <HE4SButton
            text={window.i18n('cancel')}
            buttonType={HE4SButtonType.Simple}
            onClick={() => {
              dispatch(updateDeleteAccountModal(null));
            }}
            disabled={isLoading}
          />
        </div>
        <SpacerLG />
        <HE4SSpinner loading={isLoading} />
      </div>
    </HE4SWrapperModal>
  );
};
