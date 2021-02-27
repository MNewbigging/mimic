import { observable } from 'mobx';
import Peer from 'peerjs';

export enum PlayerStatus {
  WAITING = 'WAITING...',
}

export class GameState {
  public yourPlayer: Peer;
  public yourPlayerName: string;
  @observable public yourPlayerStatus = PlayerStatus.WAITING;

  public otherPlayer?: Peer;
  @observable public otherPlayerName = 'Player 2';
  @observable public otherPlayerStatus = PlayerStatus.WAITING;

  constructor(yourPlayer: Peer, yourPlayerName: string) {
    this.yourPlayer = yourPlayer;
    this.yourPlayerName = yourPlayerName;
  }
}
