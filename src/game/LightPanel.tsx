import { observer } from 'mobx-react';
import React from 'react';

import './light-panel.scss';

@observer
export class LightPanel extends React.PureComponent {
  public render() {
    return (
      <div className={'light-panel'}>
        <div className={'light red'}></div>
        <div className={'light green'}></div>
        <div className={'light blue'}></div>
        <div className={'light orange'}></div>
        <div className={'light purple'}></div>
      </div>
    );
  }
}
