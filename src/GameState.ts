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
  @observable public lightPanelActive = false;

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

  @action public addToSequence(id: string) {
    if (this.yourSequence.length < this.round) {
      this.yourSequence.push(id);
    }
  }

  @action public removeFromSequence() {
    this.yourSequence.pop();
  }

  private nextRound() {
    this.round++;
    this.lightPanelActive = true;
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

  @action private playSequence() {
    this.lightPanelActive = false;
    this.flashLight(0);
  }

  private flashLight(idx: number) {
    const dummySequence = ['r', 'r', 'b', 'r', 'r'];
    document.getElementById(dummySequence[idx]).classList.add('flash');
    const nextIdx = idx + 1;
    if (nextIdx >= dummySequence.length) {
      this.lightPanelActive = true;
      return;
    }
    setTimeout(() => this.flashLight(nextIdx), 550);
  }
}
