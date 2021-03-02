import { observer } from 'mobx-react';
import React from 'react';

import { Button } from './Button';

import './alert.scss';

interface AlertProps {
  open: boolean;
  title: string;
  content: string;
}

@observer
export class Alert extends React.PureComponent<AlertProps> {
  public render() {
    const { open, title, content } = this.props;
    const openClosed = open ? 'open' : 'closed';

    return (
      <div className={'alert ' + openClosed}>
        {title && <div className={'heading'}>{title}</div>}
        <div className={'content'}>{content}</div>
      </div>
    );
  }
}
