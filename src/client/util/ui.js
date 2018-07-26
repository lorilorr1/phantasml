/**
 * UI utility components.
 *
 * @module client/util/ui
 * @flow
 */

import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import {Modal, ModalHeader, ModalBody, ModalFooter, Button} from 'reactstrap';

/**
 * Base for dialogs that make requests to the server.
 */
export class RequestDialog<T> extends React.Component<
  {
    header: mixed,
    children?: mixed,
    makeRequest: () => Promise<T>,
    onClosed: T => void,
    cancelable?: boolean,
  },
  {open: boolean, loading: boolean, error: ?Error},
> {
  state = {open: true, loading: false, error: null};

  _result: T;

  _cancel = this.props.cancelable ? () => this.setState({open: false}) : null;

  _submit = async () => {
    this.setState({loading: true});
    try {
      this._result = await this.props.makeRequest();
      this.setState({open: false, loading: false, error: null});
    } catch (error) {
      this.setState({loading: false, error});
    }
  };

  _onClosed = () => {
    this.props.onClosed(this._result);
  };

  render() {
    return (
      <Modal
        isOpen={this.state.open}
        centered={true}
        toggle={this.state.loading ? null : this._cancel}
        onClosed={this._onClosed}>
        <ModalHeader toggle={this.state.loading ? null : this._cancel}>
          {this.props.header}
        </ModalHeader>
        <ModalBody>{this.props.children}</ModalBody>
        <ModalFooter>
          {this._cancel ? (
            <CancelButton
              disabled={this.state.loading}
              onClick={this._cancel}
            />
          ) : null}
          <OkButton disabled={this.state.loading} onClick={this._submit} />
        </ModalFooter>
      </Modal>
    );
  }
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
 * A generic OK button.
 *
 * @param props properties to pass to the button.
 */
export function OkButton(props: Object) {
  return (
    <Button color="primary" {...props}>
      <FormattedMessage id="ok" defaultMessage="OK" />
    </Button>
  );
}
