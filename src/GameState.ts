import { action, observable } from 'mobx';
import Peer from 'peerjs';

import { AlertDuration, alerter } from './core/Alerter';
import { GameUtils } from './game/GameUtils';
import {
  BaseMessage,
  MessageType,
  NameMessage,
  ResponseMessage,
  RoundMessage,
  SequenceMessage,
} from './Messages';

// Tracks overall state of the game
export enum GameStates {
  INIT, // before first round has started; players joining/performing setup
  PLAYING, // game is in progress
  ENDED, // game has stopped; someone has won
}

// Just used for display
export enum PlayerStatus {
  WAITING = 'WAITING...',
  JOINING = 'JOINING...',
  DISCONNECTED = 'DISCONNECTED',
  PLAYING_SEQUENCE = 'PLAYING SEQUENCE',
  PLAYING_RESPONSE = 'PLAYING RESPONSE',
  WAITING_SEQUENCE = 'WAITING FOR SEQUENCE',
  WAITING_RESPONSE = 'WAITING FOR RESPONSE',
  CHECKING_RESPONSE = 'CHECKING RESPONSE',
  WINNER = 'WON',
  LOSER = 'LOST',
}

enum PlayerTurnStates {
  NEXT_ROUND = 'NEXT ROUND',
  PLAY_SEQ = 'PLAYING SEQUENCE',
  WAIT_RESP = 'WAITING FOR RESPONSE',
  WAIT_SEQ = 'WAITING FOR SEQUENCE',
  PLAY_RESP = 'PLAYING RESPONSE',
}

const HostTurnStatesArray = [
  PlayerTurnStates.NEXT_ROUND,
  PlayerTurnStates.PLAY_SEQ,
  PlayerTurnStates.WAIT_RESP,
  PlayerTurnStates.WAIT_SEQ,
  PlayerTurnStates.PLAY_RESP,
];

const JoinTurnStatesArray = [
  PlayerTurnStates.NEXT_ROUND,
  PlayerTurnStates.WAIT_SEQ,
  PlayerTurnStates.PLAY_RESP,
  PlayerTurnStates.PLAY_SEQ,
  PlayerTurnStates.WAIT_RESP,
];

export class GameState {
  // Current player props
  public yourPlayer: Peer;
  public yourPlayerName: string;
  @observable public yourPlayerStatus = PlayerStatus.WAITING;
  @observable public yourSequence: string[] = [];
  public yourTurnStates: string[] = [];
  @observable public yourCurrentTurnState = 'WAITING';

  // Other player props
  public otherPlayer?: Peer.DataConnection;
  @observable public otherPlayerName = '';
  @observable public otherPlayerState = '';
  @observable public otherSequence: string[] = [];

  // Game props
  @observable public helpText = '';
  public gameStatus = GameStates.INIT;
  @observable public round = 0;
  @observable public lightPanelActive = false;
  public gameOver = false;
  public winner = '';
  public loser = '';

  constructor(yourPlayer: Peer, yourPlayerName: string) {
    this.yourPlayer = yourPlayer;
    this.yourPlayerName = yourPlayerName;
  }

  // Called when both players are connected and ready to start game
  public readyUp(host: boolean) {
    // Initialise player turn state based on whether they're host or not
    // Put to last item, so when we start it'll move to first item
    if (host) {
      this.yourTurnStates = HostTurnStatesArray;
      this.yourCurrentTurnState = HostTurnStatesArray[HostTurnStatesArray.length - 1];
    } else {
      this.yourTurnStates = JoinTurnStatesArray;
      this.yourCurrentTurnState = JoinTurnStatesArray[JoinTurnStatesArray.length - 1];
    }

    // Then kick off game
    this.nextTurnState();
  }

  @action public receiveMessage(message: BaseMessage) {
    console.log(`${this.yourPlayerName} received message from ${this.otherPlayerName}: `, message);
    switch (message.type) {
      case MessageType.NAME:
        this.otherPlayerName = (message as NameMessage).name;
        break;
      case MessageType.SEQUENCE:
        this.otherSequence = (message as SequenceMessage).sequence;
        this.playSequence(this.otherPlayerName, this.otherSequence);
        this.yourPlayerStatus = PlayerStatus.PLAYING_RESPONSE;
        this.otherPlayerState = PlayerStatus.WAITING_RESPONSE;
        break;
      case MessageType.RESPONSE:
        const respMsg = message as ResponseMessage;
        this.otherSequence = respMsg.sequence;
        this.gameOver = !respMsg.match;
        this.winner = this.yourPlayerName;
        this.loser = this.otherPlayerName;
        this.playResponse(this.otherPlayerName, this.otherSequence);
        this.yourPlayerStatus = PlayerStatus.CHECKING_RESPONSE;
        this.otherPlayerState = PlayerStatus.CHECKING_RESPONSE;
        break;
    }
  }

  @action public addToSequence(id: string) {
    if (this.yourSequence.length < this.round) {
      this.yourSequence.push(id);
    }
  }

  @action public removeFromSequence() {
    this.yourSequence.pop();
  }

  public submitSequence() {
    // Are we submitting a new sequence or a response to one?
    let msg: BaseMessage;
    switch (this.yourPlayerStatus) {
      case PlayerStatus.PLAYING_SEQUENCE:
        // Need to send sequence to the other player, so they can respond
        msg = new SequenceMessage(this.yourSequence);
        // We are now awaiting other's response sequence
        this.yourPlayerStatus = PlayerStatus.WAITING_RESPONSE;
        this.otherPlayerState = PlayerStatus.PLAYING_RESPONSE;
        this.playSequence(this.yourPlayerName, this.yourSequence);
        break;
      case PlayerStatus.PLAYING_RESPONSE:
        const match = GameUtils.doSequencesMatch(this.yourSequence, this.otherSequence);
        // Now need to check if response was a match
        if (!match) {
          // You lost!
          this.gameOver = true;
          this.winner = this.otherPlayerName;
          this.loser = this.yourPlayerName;
        }
        // Need to send response to other player, so they can play it and see result
        this.yourPlayerStatus = PlayerStatus.CHECKING_RESPONSE;
        this.otherPlayerState = PlayerStatus.CHECKING_RESPONSE;
        msg = new ResponseMessage(this.yourSequence, match);
        this.playResponse(this.yourPlayerName, this.yourSequence);
        break;
    }

    this.otherPlayer?.send(JSON.stringify(msg));
  }

  @action public replayGame(_fromStart: boolean) {
    // Close the game over alert
    alerter.closeGameOverAlert();
    // Reset for a new game
    this.round = 0;
    this.gameOver = false;
    this.winner = '';
    this.loser = '';
    // work out who should go first, send message?
  }

  private nextTurnState() {
    // Move to next turn state
    this.incrementTurnState();

    // Then action it
    this.actionNewTurnState();
  }

  private incrementTurnState() {
    // Need to move your turn state along by 1, loop if at end
    const idx = this.yourTurnStates.indexOf(this.yourCurrentTurnState);
    let newIdx = idx + 1;
    if (newIdx === this.yourTurnStates.length) {
      newIdx = 0;
    }
    this.yourCurrentTurnState = this.yourTurnStates[newIdx];
  }

  @action private actionNewTurnState() {
    switch (this.yourCurrentTurnState) {
      case PlayerTurnStates.NEXT_ROUND:
        this.nextRound();
        break;
      case PlayerTurnStates.PLAY_SEQ:
        // Update help text
        this.helpText = `${this.otherPlayerName} is waiting for your sequence`;
        break;
      case PlayerTurnStates.WAIT_SEQ:
        // Update help text
        this.helpText = `${this.otherPlayerName} is making their sequence`;
        break;
      case PlayerTurnStates.PLAY_RESP:
        // Update help text
        this.helpText = `${this.otherPlayerName} is waiting for your response`;
        break;
      case PlayerTurnStates.WAIT_RESP:
        // Update help text
        this.helpText = `${this.otherPlayerName} is making their response`;
        break;
    }
  }

  @action private nextRound() {
    this.round++;
    const title = `Round ${this.round}`;
    const starter =
      this.yourCurrentTurnState === PlayerTurnStates.PLAY_SEQ
        ? this.yourPlayerName
        : this.otherPlayerName;
    const content = starter + ' starts';

    alerter.showAlert({
      title,
      content,
      duration: AlertDuration.NORMAL,
      onHide: () => this.nextTurnState(),
    });
  }

  @action private playSequence(name: string, sequence: string[]) {
    this.lightPanelActive = false;
    const alertContent = `${name}'s sequence...`;
    //alerter.showAlert(AlertDuration.QUICK, alertContent);

    // Timeout here is to allow time for alert to hide
    setTimeout(
      () => GameUtils.flashLight(0, sequence, this.onSequenceEnd),
      AlertDuration.QUICK + 300
    );
  }

  @action private playResponse(name: string, sequence: string[]) {
    this.lightPanelActive = false;
    const alertContent = `${name}'s response...`;
    //alerter.showAlert(AlertDuration.QUICK, alertContent);

    setTimeout(
      () => GameUtils.flashLight(0, sequence, this.onResponseEnd),
      AlertDuration.QUICK + 300
    );
  }

  private readonly onSequenceEnd = () => {
    this.lightPanelActive = true;
  };

  private readonly onResponseEnd = () => {
    // Game might have ended
    if (this.gameOver) {
      this.showGameOver();
    } else {
      this.lightPanelActive = true;
    }
  };

  private showGameOver() {
    // Update statuses
    if (this.winner === this.yourPlayerName) {
      this.yourPlayerStatus = PlayerStatus.WINNER;
      this.otherPlayerState = PlayerStatus.LOSER;
    } else {
      this.yourPlayerStatus = PlayerStatus.LOSER;
      this.otherPlayerState = PlayerStatus.WINNER;
    }
    // Show alert
    const title = 'GAME OVER!';
    const content = `${this.loser} failed to match ${this.winner}'s sequence!`;
    alerter.showGameOverAlert(content, title);
  }
}
