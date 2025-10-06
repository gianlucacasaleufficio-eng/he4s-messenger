import autoBind from 'auto-bind';
import classNames from 'classnames';
import { isString } from 'lodash';
import { PureComponent, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import { HE4SButton, HE4SButtonColor, HE4SButtonType } from './basic/HE4SButton';
// import { HE4SSpinner } from './basic/HE4SSpinner';
import { HE4STheme } from '../themes/HE4STheme';
import { switchPrimaryColorTo } from '../themes/switchPrimaryColor';
import { switchThemeTo } from '../themes/switchTheme';
import { HE4SToastContainer } from './HE4SToastContainer';
import { HE4SWrapperModal } from './HE4SWrapperModal';
import { HE4SToast } from './basic/HE4SToast';
import { HE4SSpinner } from './loading';
import { Localizer } from './basic/Localizer';

interface State {
  errorCount: number;
  clearDataView: boolean;
  loading: boolean;
}

export const MAX_LOGIN_TRIES = 3;

const TextPleaseWait = (props: { isLoading: boolean }) => {
  if (!props.isLoading) {
    return null;
  }
  return (
    <div>
      <Localizer token="waitOneMoment" />
    </div>
  );
};

const StyledContent = styled.div`
  background-color: var(--background-secondary-color);
  height: 100%;
  width: 100%;
`;

// We cannot import toastutils from the password window as it is pulling the whole sending
// pipeline(and causing crashes on HE4S instances with password)
function pushToastError(id: string, title: string, description?: string) {
  toast.error(<HE4SToast title={title} description={description} />, {
    toastId: id,
    updateId: id,
  });
}

class HE4SPasswordPromptInner extends PureComponent<unknown, State> {
  private inputRef?: any;

  constructor(props: any) {
    super(props);

    this.state = {
      errorCount: 0,
      clearDataView: false,
      loading: false,
    };

    autoBind(this);
  }

  public componentDidMount() {
    setTimeout(() => {
      this.inputRef?.focus();
    }, 100);
  }

  public render() {
    const isLoading = this.state.loading;
    const spinner = isLoading ? <HE4SSpinner loading={true} /> : null;
    const featureElement = this.state.clearDataView ? (
      <p>
        <Localizer token="clearDeviceDescription" />
      </p>
    ) : (
      <div className="he4s-modal__input-group">
        <input
          type="password"
          id="password-prompt-input"
          defaultValue=""
          placeholder={window.i18n('passwordEnter')}
          onKeyUp={this.onKeyUp}
          ref={input => {
            this.inputRef = input;
          }}
        />
      </div>
    );

    return (
      <HE4SWrapperModal
        title={this.state.clearDataView ? window.i18n('clearDevice') : window.i18n('passwordEnter')}
      >
        {spinner || featureElement}
        <TextPleaseWait isLoading={isLoading} />
        {this.state.clearDataView
          ? this.renderClearDataViewButtons()
          : this.renderPasswordViewButtons()}
      </HE4SWrapperModal>
    );
  }

  public onKeyUp(event: any) {
    switch (event.key) {
      case 'Enter':
        this.initLogin();
        break;
      default:
    }
    event.preventDefault();
  }

  public async onLogin(passPhrase: string) {
    // Note: we don't trim the password anymore. If the user entered a space at the end, so be it.
    try {
      await window.onLogin(passPhrase);
    } catch (error) {
      // Increment the error counter and show the button if necessary
      this.setState({
        errorCount: this.state.errorCount + 1,
      });

      if (error && isString(error)) {
        pushToastError('onLogin', error);
      } else if (error?.message && isString(error.message)) {
        pushToastError('onLogin', error.message);
      }

      global.setTimeout(() => {
        document.getElementById('password-prompt-input')?.focus();
      }, 50);
    }
    this.setState({
      loading: false,
    });
  }

  private initLogin() {
    this.setState({
      loading: true,
    });
    const passPhrase = String((this.inputRef as HTMLInputElement).value);

    // this is to make sure a render has the time to happen before we lock the thread with all of the db work
    // this might be removed once we get the db operations to a worker thread
    global.setTimeout(() => {
      void this.onLogin(passPhrase);
    }, 100);
  }

  private initClearDataView() {
    this.setState({
      errorCount: 0,
      clearDataView: true,
    });
  }

  private renderPasswordViewButtons(): JSX.Element {
    const showResetElements = this.state.errorCount >= MAX_LOGIN_TRIES;

    return (
      <div className={classNames(showResetElements && 'he4s-modal__button-group')}>
        {showResetElements && (
          <>
            <HE4SButton
              text={window.i18n('clearDevice')}
              buttonColor={HE4SButtonColor.Danger}
              buttonType={HE4SButtonType.Simple}
              onClick={this.initClearDataView}
            />
          </>
        )}
        {!this.state.loading && (
          <HE4SButton
            text={showResetElements ? window.i18n('tryAgain') : window.i18n('done')}
            buttonType={HE4SButtonType.Simple}
            onClick={this.initLogin}
            disabled={this.state.loading}
          />
        )}
      </div>
    );
  }

  private renderClearDataViewButtons(): JSX.Element {
    return (
      <div className="he4s-modal__button-group">
        <HE4SButton
          text={window.i18n('clearDevice')}
          buttonColor={HE4SButtonColor.Danger}
          buttonType={HE4SButtonType.Simple}
          onClick={window.clearLocalData}
        />
        <HE4SButton
          text={window.i18n('cancel')}
          buttonType={HE4SButtonType.Simple}
          onClick={() => {
            this.setState({ clearDataView: false });
          }}
        />
      </div>
    );
  }
}

export const HE4SPasswordPrompt = () => {
  useEffect(() => {
    if (window.theme) {
      void switchThemeTo({
        theme: window.theme,
      });
    }
    if (window.primaryColor) {
      void switchPrimaryColorTo(window.primaryColor);
    }
  }, []);

  return (
    <HE4STheme>
      <HE4SToastContainer />
      <StyledContent>
        <HE4SPasswordPromptInner />
      </StyledContent>
    </HE4STheme>
  );
};
