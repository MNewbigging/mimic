import { observer } from 'mobx-react';
import React from 'react';

import './player-details.scss';

@observer
export class PlayerDetails extends React.PureComponent {
  public render() {
    return (
      <div className={'player-details'}>
        <div className={'box'}>Player name</div>
        <div className={'box'}>Status...</div>
      </div>
    );
  }
}
