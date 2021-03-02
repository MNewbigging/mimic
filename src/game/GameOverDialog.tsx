import { observer } from 'mobx-react';
import React from 'react';

import { Button } from '../core/Button';
import { Dialog } from '../core/Dialog';
import { Dialogs } from '../core/DialogState';
import { GameState } from '../GameState';

import './game-over-dialog.scss';

interface GODProps {
  state: GameState;
}

@observer
export class GameOverDialog extends React.PureComponent<GODProps> {
  public render() {
    return (
      <Dialog
        type={Dialogs.GAME_OVER}
        title={'GAME OVER!'}
        content={this.renderContent()}
        actionRail={this.renderActionRail()}
      />
    );
  }

  private renderContent() {
    const { state } = this.props;
    return <div>{state.winner} won!</div>;
  }

  private renderActionRail() {
    const { state } = this.props;
    return (
      <div className={'ar-replay'}>
        Replay:
        <Button text={'Round 1'} onClick={() => state.replayGame(true)} />
        <Button text={'Last Round'} onClick={() => state.replayGame(false)} />
      </div>
    );
  }
}
