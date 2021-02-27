import { observer } from 'mobx-react';
import React from 'react';

import { GameState } from '../GameState';
import { LightPanel } from './LightPanel';
import { PlayerDetails } from './PlayerDetails';

import './game-screen.scss';

interface GameProps {
  state: GameState;
}

@observer
export class GameScreen extends React.PureComponent<GameProps> {
  public render() {
    const { state } = this.props;

    return (
      <div className={'game-screen'}>
        <div className={'player-area'}>
          <div className={'other player'}>
            <PlayerDetails name={state.otherPlayerName} status={state.otherPlayerStatus} />
          </div>
        </div>
        <div className={'game-body'}>
          <div className={'round-marker'}>ROUND 1</div>
          <div className={'light-panel-area'}>
            <LightPanel />
          </div>
          <div className={'player-light-panel'}></div>
        </div>
        <div className={'player-area'}>
          <div className={'your player'}>
            <PlayerDetails name={state.yourPlayerName} status={state.yourPlayerStatus} />
          </div>
        </div>
      </div>
    );
  }
}
