import { observer } from 'mobx-react';
import React from 'react';

import { PlayerDetails } from './PlayerDetails';

import './game-screen.scss';

@observer
export class GameScreen extends React.PureComponent {
  public render() {
    return (
      <div className={'game-screen'}>
        <div className={'player-area'}>
          <div className={'other player'}>
            <PlayerDetails />
          </div>
        </div>
        <div className={'game-body'}>
          <div className={'round-marker'}>ROUND 1</div>
          <div className={'light-panel'}></div>
          <div className={'player-light-panel'}></div>
        </div>
        <div className={'player-area'}>
          <div className={'your player'}>
            <PlayerDetails />
          </div>
        </div>
      </div>
    );
  }
}
