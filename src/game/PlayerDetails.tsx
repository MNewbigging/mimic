import { observer } from 'mobx-react';
import React from 'react';

import './player-details.scss';

interface DetailsProps {
  name: string;
  status: string;
}

@observer
export class PlayerDetails extends React.PureComponent<DetailsProps> {
  public render() {
    const { name, status } = this.props;

    return (
      <div className={'player-details'}>
        <div className={'box'}>{name}</div>
        <div className={'box'}>{status}</div>
      </div>
    );
  }
}
