/**
 * UI utility components.
 *
 * @module client/util/ui
 * @flow
 */

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import type {Element} from 'react';
import {IntlProvider, FormattedMessage, injectIntl} from 'react-intl';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  CustomInput,
  Navbar,
  NavbarToggler,
  Collapse,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

/**
 * Base for dialogs that make requests to the server.
 *
 * @param props.header the contents of the dialog header.
 * @param props.children the contents of the dialog body.
 * @param props.loadState optional function to load the initial dialog state.
 * @param props.makeRequest the function to use to make the request.  Return
 * [result, true] to keep the dialog open even if the request succeeds.
 * @param props.autoRequest if true, start the request process automatically
 * (don't wait for the user to click OK).
 * @param props.invalid if true, the input is invalid and the request cannot
 * be made.
 * @param props.getFeedback an optional function to generate custom feedback
 * for result/errors.
 * @param props.onClosed an optional function to invoke with the result (if
 * any) when the dialog is completely closed.
 * @param props.applicable if true, the dialog can be applied without closing.
 * @param props.cancelable if true, the dialog can be closed without making the
 * request.
 */
export class RequestDialog<T: Object> extends React.Component<
  {
    header: any,
    children?: mixed,
    loadState?: () => Promise<void>,
    makeRequest: () => Promise<T | [T, boolean]>,
    autoRequest?: boolean,
    invalid?: boolean,
    getFeedback?: (T | Error) => ?React.Element<any>,
    onClosed?: (?T) => void,
    applicable?: boolean,
    cancelable?: boolean,
  },
  {open: boolean, loading: boolean, result: ?T | Error},
> {
  state = {open: true, loading: !!this.props.loadState, result: null};

  _renderedResult: ?T | Error;

  render() {
    const displayResult = this.state.result;
    const resultFeedback =
      (displayResult &&
        (this.props.getFeedback && this.props.getFeedback(displayResult))) ||
      (displayResult instanceof Error ? (
        <ErrorMessage error={displayResult} />
      ) : null);
    return (
      <Modal
        isOpen={this.state.open}
        centered={true}
        toggle={this.state.loading ? null : this._cancel}
        onClosed={this._onClosed}>
        <div className="modal-header">
          <h5 className="modal-title">{this.props.header}</h5>
          {this._cancel ? (
            <button
              type="button"
              className="close"
              disabled={this.state.loading}
              onClick={this._cancel}>
              <span aria-hidden="true">&times;</span>
            </button>
          ) : null}
        </div>
        <ModalBody>
          {this.props.children}
          {resultFeedback ? (
            <div className="text-warning text-center request-error">
              {resultFeedback}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          {this.state.loading ? (
            <div className="flex-grow-1">
              <LoadingSpinner />
            </div>
          ) : null}
          {this._cancel ? (
            <CancelButton
              disabled={this.state.loading}
              onClick={this._cancel}
            />
          ) : null}
          {this.props.applicable ? (
            <ApplyButton
              disabled={this.state.loading || this.props.invalid}
              onClick={this._apply}
            />
          ) : null}
          <OkButton
            disabled={this.state.loading || this.props.invalid}
            onClick={this._submit}
          />
        </ModalFooter>
      </Modal>
    );
  }

  async componentDidMount() {
    const loadState = this.props.loadState;
    if (!loadState) {
      return;
    }
    try {
      await loadState();
      this.setState({loading: false});
    } catch (error) {
      this.setState({loading: false, result: error});
    }
  }

  componentDidUpdate() {
    if (this.state.result) {
      // the first time we see the result, we render it.
      // the next time, we clear it out (assuming that some other state
      // update means the user has seen it)
      if (this.state.result !== this._renderedResult) {
        this._renderedResult = this.state.result;
      } else {
        this._renderedResult = null;
        this.setState({result: null});
      }
    }
    if (this.props.autoRequest && !this.state.loading) {
      this._submit();
    }
  }

  _cancel = this.props.cancelable ? () => this.setState({open: false}) : null;

  _apply = async () => {
    this.setState({loading: true, result: null});
    try {
      const response = await this.props.makeRequest();
      const [result, open] = Array.isArray(response)
        ? (response: any)
        : [response, false];
      this.setState({loading: false, result});
    } catch (error) {
      this.setState({loading: false, result: error});
    }
  };

  _submit = async () => {
    this.setState({loading: true, result: null});
    try {
      const response = await this.props.makeRequest();
      const [result, open] = Array.isArray(response)
        ? (response: any)
        : [response, false];
      this.setState({open, loading: false, result});
    } catch (error) {
      this.setState({loading: false, result: error});
    }
  };

  _onClosed = () => {
    this.props.onClosed &&
      this.props.onClosed(
        this.state.result instanceof Error ? null : this.state.result,
      );
  };
}

/**
 * A simple dialog to report an error message.
 *
 * @param props.error the error to report.
 * @param props.getErrorMessage an optional function to retrieve the formatted
 * message corresponding to the error.
 * @param props.closeMessage the message to show on the close button ('OK' by
 * default).
 * @param props.onClosed the function to call when the dialog is closed.
 */
export function ErrorDialog(props: {
  error: Error,
  getErrorMessage?: Error => ?React.Element<any>,
  closeMessage?: React.Element<any>,
  onClosed: () => mixed,
}) {
  return (
    <FeedbackDialog
      title={<FormattedMessage id="error.title" defaultMessage="Error" />}
      closeMessage={props.closeMessage}
      onClosed={props.onClosed}>
      <ErrorMessage
        error={props.error}
        getErrorMessage={props.getErrorMessage}
      />
    </FeedbackDialog>
  );
}

/**
 * A simple dialog to report a feedback message.
 *
 * @param props.title the title of the message.
 * @param props.children the contents of the message.
 * @param props.closeMessage the message to show on the close button ('OK' by
 * default).
 * @param props.onClosed the function to call when the dialog is closed.
 */
export class FeedbackDialog extends React.Component<
  {
    title: mixed,
    children: mixed,
    closeMessage?: React.Element<any>,
    onClosed: () => mixed,
  },
  {open: boolean},
> {
  state = {open: true};

  render() {
    return (
      <Modal
        isOpen={this.state.open}
        centered={true}
        onClosed={this.props.onClosed}>
        <ModalHeader>{this.props.title}</ModalHeader>
        <ModalBody>{this.props.children}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => this.setState({open: false})}>
            {this.props.closeMessage || <OkMessage />}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

/**
 * A small loading spinner.
 */
export function LoadingSpinner() {
  return <div className="loading loading-small" />;
}

/**
 * A generic cancel button.
 *
 * @param props properties to pass to the button.
 */
export function CancelButton(props: Object) {
  return (
    <Button color="secondary" {...props}>
      <FormattedMessage id="cancel" defaultMessage="Cancel" />
    </Button>
  );
}

/**
 * A generic apply button.
 *
 * @param props properties to pass to the button.
 */
export function ApplyButton(props: Object) {
  return (
    <Button color="primary" {...props}>
      <FormattedMessage id="apply" defaultMessage="Apply" />
    </Button>
  );
}

/**
 * A generic OK button.
 *
 * @param props properties to pass to the button.
 */
export function OkButton(props: Object) {
  return (
    <Button color="primary" {...props}>
      <OkMessage />
    </Button>
  );
}

/**
 * Generic OK message.
 */
function OkMessage() {
  return <FormattedMessage id="ok" defaultMessage="OK" />;
}

/**
 * Renders an error message.
 *
 * @param props.error the error to report.
 * @param props.getErrorMessage an optional function to retrieve the formatted
 * message corresponding to the error.
 */
function ErrorMessage(props: {
  error: Error,
  getErrorMessage?: Error => ?React.Element<any>,
}) {
  if (props.getErrorMessage) {
    const message = props.getErrorMessage(props.error);
    if (message) {
      return message;
    }
  }
  switch (props.error.message) {
    case 'error.expired':
      return (
        <FormattedMessage
          id="error.expired"
          defaultMessage={
            'Sorry, your session has expired.  Please reload the page.'
          }
        />
      );
    case 'error.resource':
      return (
        <FormattedMessage
          id="error.resource"
          defaultMessage="Sorry, this resource has been deleted."
        />
      );
    default:
      return (
        <FormattedMessage
          id="error.server"
          defaultMessage="Sorry, an error occurred connecting to the server."
        />
      );
  }
}

/**
 * A checkbox with a translatable label.
 *
 * @param props properties to pass to the input component.
 * @param props.label the label to apply to the checkbox (must be a
 * FormattedMessage).
 */
export const LabeledCheckbox = injectIntl((props: Object) => {
  return (
    <CustomInput
      type="checkbox"
      {...props}
      label={props.intl.formatMessage(
        props.label.props,
        props.label.props.values,
      )}
    />
  );
});

const dummyComponent = {props: {}, state: {}, setState: state => undefined};
const MenuBarContext = React.createContext(dummyComponent);

/**
 * A menu bar.
 *
 * @param props.disabled if true, disable all menus on the bar.
 * @param props.brand the contents of the brand section.
 * @param props.children the bar contents.
 */
export class MenuBar extends React.Component<
  {disabled?: ?boolean, brand?: mixed, children?: mixed},
  {open: boolean, active: boolean, hoverItem: ?React.Component<any, any>},
> {
  state = {open: false, active: false, hoverItem: null};

  render() {
    return (
      <Navbar className="menu-bar" color="primary" dark expand="md">
        {this.props.brand}
        <NavbarToggler onClick={this._toggle} />
        <Collapse isOpen={this.state.open} navbar>
          <MenuBarContext.Provider value={this}>
            {this.props.children}
          </MenuBarContext.Provider>
        </Collapse>
      </Navbar>
    );
  }

  _toggle = () => this.setState({open: !this.state.open});
}

const MenuContext = React.createContext(dummyComponent);

/**
 * A dropdown menu with submenu support.
 *
 * @param props.label the menu label.
 * @param props.children the menu contents.
 */
export class Menu extends React.Component<
  {label: React.Element<any>, disabled?: ?boolean, children?: mixed},
  {hoverItem: ?React.Component<any, any>},
> {
  state = {hoverItem: null};

  render() {
    return (
      <MenuBarContext.Consumer>
        {menuBar => (
          <Dropdown
            nav
            onMouseOver={event => menuBar.setState({hoverItem: this})}
            isOpen={menuBar.state.active && menuBar.state.hoverItem === this}
            toggle={() => menuBar.setState({active: !menuBar.state.active})}>
            <DropdownToggle
              disabled={menuBar.props.disabled || this.props.disabled}
              nav
              caret
              onMouseOver={event =>
                menuBar.state.active && event.target.focus()
              }>
              {this.props.label}
            </DropdownToggle>
            <DropdownMenu>
              <MenuContext.Provider value={this}>
                {this.props.children}
              </MenuContext.Provider>
            </DropdownMenu>
          </Dropdown>
        )}
      </MenuBarContext.Consumer>
    );
  }
}

/**
 * A simple menu item.
 *
 * @param props.children the item contents.
 */
export class MenuItem extends React.Component<
  {onClick?: (SyntheticEvent<>) => mixed, children?: mixed},
  {},
> {
  render() {
    return (
      <MenuContext.Consumer>
        {menu => (
          <DropdownItem
            onClick={this.props.onClick}
            onMouseOver={event => menu.setState({hoverItem: this})}>
            {this.props.children}
          </DropdownItem>
        )}
      </MenuContext.Consumer>
    );
  }
}

function RawButton(props: Object) {
  const {innerRef, onClick, ...rest} = props;
  return <button ref={innerRef} {...rest} tabIndex={-1} />;
}

/**
 * A submenu for dropdown menus.
 *
 * @param props.label the menu label.
 * @param props.children the menu contents.
 */
export class Submenu extends React.Component<
  {label: React.Element<any>, children?: mixed},
  {hoverItem: ?React.Component<any, any>},
> {
  state = {hoverItem: null};

  render() {
    return (
      <MenuBarContext.Consumer>
        {menuBar => (
          <MenuContext.Consumer>
            {menu => (
              <Dropdown
                direction="right"
                onMouseOver={event => menu.setState({hoverItem: this})}
                isOpen={menu.state.hoverItem === this}
                toggle={() =>
                  menuBar.setState({
                    active: !menuBar.state.active,
                  })
                }>
                <DropdownToggle
                  className={
                    'dropdown-item dropdown-toggle submenu-toggle' +
                    (menu.state.hoverItem === this ? ' active' : '')
                  }
                  tag={RawButton}>
                  {this.props.label}
                </DropdownToggle>
                <DropdownMenu modifiers={{offset: {offset: -9}}}>
                  <MenuContext.Provider value={this}>
                    {this.props.children}
                  </MenuContext.Provider>
                </DropdownMenu>
              </Dropdown>
            )}
          </MenuContext.Consumer>
        )}
      </MenuBarContext.Consumer>
    );
  }
}

/**
 * Renders a React element to text with appropriate i18n.
 *
 * @param element the element to render.
 * @param locale the locale in which to render the element.
 * @return the rendered text.
 */
export function renderText(element: Element<*>, locale: string): string {
  return ReactDOMServer.renderToStaticMarkup(
    <IntlProvider
      locale={locale}
      defaultLocale="en-US"
      textComponent={(props: {children: string}) => props.children}>
      {element}
    </IntlProvider>,
  );
}
