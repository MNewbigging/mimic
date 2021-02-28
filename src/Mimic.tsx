import { observer } from 'mobx-react';
import React from 'react';

import { Alert } from './core/Alert';
import { alerter } from './core/Alerter';
import { GameScreen } from './game/GameScreen';
import { MainMenu } from './main-menu/MainMenu';
import { MimicState } from './MimicState';

@observer
export class Mimic extends React.PureComponent {
  private readonly mState = new MimicState();
  public render() {
    return (
      <>
        <Alert
          open={alerter.alertShowing}
          title={alerter.alertTitle}
          content={alerter.alertContent}
        />
        <MainMenu mState={this.mState} />
        {this.mState.gameState && <GameScreen state={this.mState.gameState} />}
      </>
    );
  }
}
