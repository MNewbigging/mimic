import { action, observable } from 'mobx';
import Peer from 'peerjs';

import { AlertDuration, alerter } from './core/Alerter';
import {
  BaseMessage,
  MessageType,
  NameMessage,
  ResponseMessage,
  RoundMessage,
  SequenceMessage,
} from './Messages';

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

export class GameState {
  // Current player props
  public yourPlayer: Peer;
  public yourPlayerName: string;
  @observable public yourPlayerStatus = PlayerStatus.WAITING;
  @observable public yourSequence: string[] = [];

  // Other player props
  public otherPlayer?: Peer.DataConnection;
  @observable public otherPlayerName = '';
  @observable public otherPlayerStatus = PlayerStatus.WAITING;
  public otherSequence: string[] = [];

  // Game props
  @observable public round = 0;
  @observable public lightPanelActive = false;
  public gameOver = false;
  public winner = '';
  public loser = '';

  constructor(yourPlayer: Peer, yourPlayerName: string) {
    this.yourPlayer = yourPlayer;
    this.yourPlayerName = yourPlayerName;
  }

  // Host always calls this
  public startGame() {
    this.nextRound();
  }

  @action public receiveMessage(message: BaseMessage) {
    console.log(`${this.yourPlayerName} received message from ${this.otherPlayerName}: `, message);
    switch (message.type) {
      case MessageType.NAME:
        this.otherPlayerName = (message as NameMessage).name;
        break;
      case MessageType.ROUND:
        // The host will never receive this; host always goes first so they start each round
        this.round = (message as RoundMessage).round;
        this.alertRound();
        break;
      case MessageType.SEQUENCE:
        this.otherSequence = (message as SequenceMessage).sequence;
        this.playSequence(this.otherPlayerName, this.otherSequence);
        this.yourPlayerStatus = PlayerStatus.PLAYING_RESPONSE;
        this.otherPlayerStatus = PlayerStatus.WAITING_RESPONSE;
        break;
      case MessageType.RESPONSE:
        const respMsg = message as ResponseMessage;
        this.otherSequence = respMsg.sequence;
        this.gameOver = !respMsg.match;
        this.winner = this.yourPlayerName;
        this.loser = this.otherPlayerName;
        this.playResponse(this.otherPlayerName, this.otherSequence);
        this.yourPlayerStatus = PlayerStatus.CHECKING_RESPONSE;
        this.otherPlayerStatus = PlayerStatus.CHECKING_RESPONSE;
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
        this.otherPlayerStatus = PlayerStatus.PLAYING_RESPONSE;
        this.playSequence(this.yourPlayerName, this.yourSequence);
        break;
      case PlayerStatus.PLAYING_RESPONSE:
        let match = true;
        // Now need to check if response was a match
        if (this.yourSequence !== this.otherSequence) {
          // You lost!
          match = false;
          this.gameOver = true;
          this.winner = this.otherPlayerName;
          this.loser = this.yourPlayerName;
        }
        // Need to send response to other player, so they can play it and see result
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

  private nextRound() {
    this.round++;
    this.lightPanelActive = true;
    this.sendRoundMessage();
    this.alertRound();
  }

  private sendRoundMessage() {
    const msg = new RoundMessage(this.round);
    this.otherPlayer?.send(JSON.stringify(msg));
  }

  private alertRound() {
    const title = `Round ${this.round}`;
    const content = `${this.yourPlayerName}'s turn...`;
    alerter.showAlert(AlertDuration.NORMAL, content, title);
  }

  @action private playSequence(name: string, sequence: string[]) {
    this.lightPanelActive = false;
    const alertContent = `${name}'s sequence...`;
    alerter.showAlert(AlertDuration.QUICK, alertContent);

    setTimeout(() => this.flashLight(0, sequence), AlertDuration.QUICK + 300);
  }

  @action private playResponse(name: string, sequence: string[]) {
    this.lightPanelActive = false;
    const alertContent = `${name}'s response...`;
    alerter.showAlert(AlertDuration.QUICK, alertContent);

    setTimeout(() => this.flashLight(0, sequence), AlertDuration.QUICK + 300);
  }

  private flashLight(idx: number, sequence: string[]) {
    document.getElementById(sequence[idx]).classList.add('flash');
    const nextIdx = idx + 1;
    if (nextIdx >= sequence.length) {
      this.lightPanelActive = true;
      setTimeout(() => this.checkGameOver(), 550);
      return;
    }
    setTimeout(() => this.flashLight(nextIdx, sequence), 550);
  }

  private checkGameOver() {
    if (this.gameOver) {
      // Update statuses
      if (this.winner === this.yourPlayerName) {
        this.yourPlayerStatus = PlayerStatus.WINNER;
        this.otherPlayerStatus = PlayerStatus.LOSER;
      } else {
        this.yourPlayerStatus = PlayerStatus.LOSER;
        this.otherPlayerStatus = PlayerStatus.WINNER;
      }
      // Show alert
      const title = 'GAME OVER!';
      const content = `${this.loser} failed to match ${this.winner}'s sequence!`;
      alerter.showGameOverAlert(content, title);
    }
  }
}
