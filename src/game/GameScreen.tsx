import { observer } from 'mobx-react';
import React from 'react';

import { GameState, PlayerStatus } from '../GameState';
import { LightPanel } from './LightPanel';
import { PlayerDetails } from './PlayerDetails';
import { SequencePanel } from './SequencePanel';

import './game-screen.scss';

interface GameProps {
  state: GameState;
}

@observer
export class GameScreen extends React.PureComponent<GameProps> {
  public render() {
    const { state } = this.props;
    const hostOrPlayer = state.otherPlayerName
      ? state.otherPlayerName
      : `Join id: ${state.yourPlayer.id}`;

    const roundMarker = state.round > 0 ? `ROUND ${state.round}` : '';
    const helpText = state.round > 0 ? this.getHelpText() : '';
    return (
      <div className={'game-screen'}>
        <div className={'player-area'}>
          <div className={'other player'}>
            <PlayerDetails name={hostOrPlayer} status={state.otherPlayerStatus} />
          </div>
        </div>
        <div className={'game-body'}>
          <div className={'round-marker'}>{roundMarker}</div>
          <div className={'help-text'}>{helpText}</div>
          <div className={'light-panel-area'}>
            <LightPanel />
          </div>
          <SequencePanel state={state} />
        </div>
        <div className={'player-area'}>
          <div className={'your player'}>
            <PlayerDetails name={state.yourPlayerName} status={state.yourPlayerStatus} />
          </div>
        </div>
      </div>
    );
  }

  private readonly getHelpText = () => {
    const { state } = this.props;
    const otherPlayer = state.otherPlayerName;
    let helpText = `${otherPlayer} `;
    switch (state.yourPlayerStatus) {
      case PlayerStatus.PLAYING_SEQUENCE:
        helpText += `is waiting for your sequence!`;
        break;
      case PlayerStatus.PLAYING_RESPONSE:
        helpText += `is waiting for your response!`;
        break;
      case PlayerStatus.WAITING_SEQUENCE:
        helpText += `is making their sequence!`;
        break;
      case PlayerStatus.WAITING_RESPONSE:
        helpText += `is making their response!`;
        break;
    }

    return helpText;
  };
}