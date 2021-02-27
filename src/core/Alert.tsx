import { observer } from 'mobx-react';
import React from 'react';

import './alert.scss';

interface AlertProps {
  open: boolean;
  content: string;
}

@observer
export class Alert extends React.PureComponent<AlertProps> {
  public render() {
    const { open, content } = this.props;
    const openClosed = open ? 'open' : 'closed';

    return (
      <div className={'alert ' + openClosed}>
        <div>{content}</div>
      </div>
    );
  }
}
