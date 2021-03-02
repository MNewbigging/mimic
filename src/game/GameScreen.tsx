import { observer } from 'mobx-react';
import React from 'react';

import { GameState } from '../GameState';
import { LightPanel } from './LightPanel';
import { PlayerDetails } from './PlayerDetails';
import { SequencePanel } from './SequencePanel';

import './game-screen.scss';
import { GameOverDialog } from './GameOverDialog';

interface GameProps {
  state: GameState;
}

@observer
export class GameScreen extends React.PureComponent<GameProps> {
  public render() {
    const { state } = this.props;
    const joinIdOrPlayer = state.otherPlayerName
      ? state.otherPlayerName
      : `Join id: ${state.yourPlayer.id}`;

    return (
      <>
        <GameOverDialog state={state} />
        <div className={'game-container'}>
          <div className={'game-screen'}>
            <div className={'other-player'}>
              <PlayerDetails name={joinIdOrPlayer} status={state.otherPlayerState} />
            </div>
            <div className={'help-text'}>
              <div className={'heading'}>{state.roundText}</div>
              <div>{state.helpText}</div>
            </div>
            <div className={'light-panel-area'}>
              <LightPanel
                active={state.lightPanelActive}
                onClick={(id: string) => state.addToSequence(id)}
              />
            </div>
            <div className={'sequence-panel-area'}>
              {state.showSequencePanel && <SequencePanel state={state} />}
            </div>
            <div className={'your-player'}>
              <PlayerDetails name={state.yourPlayerName} status={state.yourCurrentTurnState} />
            </div>
          </div>
        </div>
      </>
    );
  }
}
