import { action, observable } from 'mobx';
import Peer from 'peerjs';

import {
  BaseMessage,
  ConfirmMessage,
  MessageType,
  NameMessage,
  RoundMessage,
  StatusMessage,
} from './Messages';
import { alerter } from './core/Alerter';

export enum PlayerStatus {
  WAITING = 'WAITING...',
  JOINING = 'JOINING...',
  DISCONNECTED = 'DISCONNECTED',
  PLAYING = 'PLAYING...',
}

export class GameState {
  // Current player props
  public yourPlayer: Peer;
  public yourPlayerName: string;
  @observable public yourPlayerStatus = PlayerStatus.WAITING;

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
    // First, show the round message and tell other player to show it too
    this.round = 1;
    this.sendRoundMessage();
    this.alertRound();

    this.setYourStatus(PlayerStatus.PLAYING);
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
        this.round = (message as RoundMessage).round;
        this.alertRound();
        break;
    }
  }

  private sendConfirmMessage() {
    const msg = new ConfirmMessage();
    this.otherPlayer?.send(JSON.stringify(msg));
  }

  private setYourStatus(status: PlayerStatus) {
    this.yourPlayerStatus = status;
    this.sendStatusMessage();
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
