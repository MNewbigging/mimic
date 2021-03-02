import { observer } from 'mobx-react';
import React from 'react';

import { Dialogs, dialogState } from './DialogState';

import './dialog.scss';

interface DialogProps {
  type: Dialogs;
  title: string;
  content: JSX.Element;
  actionRail: JSX.Element;
  canClickOutsideClose?: boolean;
}

@observer
export class Dialog extends React.PureComponent<DialogProps> {
  public render() {
    const { type, title, content, actionRail, canClickOutsideClose } = this.props;
    const show = dialogState.activeDialog === type;
    const openClose = show ? 'open' : 'closed';
    const outsideClick = canClickOutsideClose ?? false;

    return (
      <>
        {outsideClick && show && (
          <div className={'dialog-backdrop'} onClick={() => this.onOutsideClick()}></div>
        )}
        <div className={'dialog ' + openClose}>
          <div className={'title'}>{title}</div>
          <div className={'content'}>{content}</div>
          <div className={'action-rail'}>{actionRail}</div>
        </div>
      </>
    );
  }

  private onOutsideClick() {
    dialogState.hideDialog();
  }
}
