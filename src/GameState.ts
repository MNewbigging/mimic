import { action, observable } from 'mobx';
import Peer from 'peerjs';

import { alerter } from './core/Alerter';
import { BaseMessage, MessageType, NameMessage, RoundMessage, StatusMessage } from './Messages';

export enum PlayerStatus {
  WAITING = 'WAITING...',
  JOINING = 'JOINING...',
  DISCONNECTED = 'DISCONNECTED',
  PLAYING_SEQUENCE = 'PLAYING SEQUENCE',
  PLAYING_RESPONSE = 'PLAYING RESPONSE',
  WAITING_SEQUENCE = 'WAITING FOR SEQUENCE',
  WAITING_RESPONSE = 'WAITING FOR RESPONSE',
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

  // Game props
  @observable public round = 0;

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
      case MessageType.STATUS:
        this.otherPlayerStatus = (message as StatusMessage).status;
        break;
      case MessageType.ROUND:
        // The host will never receive this; host always goes first so they start each round
        this.round = (message as RoundMessage).round;
        this.alertRound();
        break;
    }
  }

  public submitSequence() {
    // Is this a new sequence, or a response to one?
  }

  private setYourStatus(status: PlayerStatus) {
    this.yourPlayerStatus = status;
    this.sendStatusMessage();
  }

  private nextRound() {
    this.round++;
    this.sendRoundMessage();
    this.alertRound();
  }

  private sendStatusMessage() {
    const msg = new StatusMessage(this.yourPlayerStatus);
    this.otherPlayer?.send(JSON.stringify(msg));
  }

  private sendRoundMessage() {
    const msg = new RoundMessage(this.round);
    this.otherPlayer?.send(JSON.stringify(msg));
  }

  private alertRound() {
    const alertContent = `Round ${this.round}`;
    alerter.showAlert(alertContent);
  }
}
