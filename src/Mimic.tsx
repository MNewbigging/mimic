import { observer } from 'mobx-react';
import React from 'react';

import { MainMenu } from './main-menu/MainMenu';
import { MimicState } from './MimicState';

@observer
export class Mimic extends React.PureComponent {
  private readonly mState = new MimicState();
  public render() {
    return (
      <>
        <MainMenu mState={this.mState} />
        <div>Mimic</div>
      </>
    );
  }
}
