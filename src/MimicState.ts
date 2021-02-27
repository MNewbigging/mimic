import { action, observable } from 'mobx';

import { GameState, PlayerStatus } from './GameState';

import Peer from 'peerjs';
import { NameMessage } from './Messages';

export class MimicState {
  // Menu props
  @observable public menuOpen = false;
  @observable public name = '';
  @observable public hostId = '';
  @observable public joinId = '';

  // Player props
  public peer: Peer;

  // Game props
  @observable public gameState?: GameState;

  constructor() {
    this.peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
        ],
      },
    });

    this.peer.on('open', (id: string) => {
      this.hostId = id;
    });
  }

  @action public setName(name: string) {
    this.name = name;
  }

  @action public setHostId(id: string) {
    this.hostId = id;
  }

  @action public setJoinId(id: string) {
    this.joinId = id;
  }

  @action public hostGame() {
    // Host enters game immediately
    this.gameState = new GameState(this.peer, this.name);

    this.peer.on('connection', (conn: Peer.DataConnection) => {
      this.gameState.otherPlayerName = conn.label;
      this.gameState.otherPlayerStatus = PlayerStatus.JOINING;

      conn.on('open', () => {
        conn.peerConnection.onconnectionstatechange = (_ev: Event) => {
          if (conn.peerConnection.connectionState === 'disconnected') {
            this.gameState.otherPlayerStatus = PlayerStatus.DISCONNECTED;
          }
        };
        conn.on('close', () => (this.gameState.otherPlayerStatus = PlayerStatus.DISCONNECTED));
        conn.on('data', (data: any) => this.gameState.receiveMessage(JSON.parse(data)));

        this.gameState.otherPlayer = conn;
        this.gameState.yourPlayerStatus = PlayerStatus.PLAYING_SEQUENCE;
        this.gameState.otherPlayerStatus = PlayerStatus.WAITING_SEQUENCE;

        const nameMsg = new NameMessage(this.name);
        conn.send(JSON.stringify(nameMsg));

        setTimeout(() => this.gameState.startGame(), 1000);
      });
    });

    this.menuOpen = true;
  }

  @action public joinGame() {
    console.log('joining game');

    this.gameState = new GameState(this.peer, this.name);
    this.gameState.otherPlayerStatus = PlayerStatus.PLAYING_SEQUENCE;
    this.gameState.yourPlayerStatus = PlayerStatus.WAITING_SEQUENCE;

    // Connect to given host id
    this.gameState.otherPlayer = this.peer.connect(this.joinId, { label: this.name });

    this.gameState.otherPlayer.peerConnection.onconnectionstatechange = (_ev: Event) => {
      const conState = this.gameState.otherPlayer.peerConnection.connectionState;
      switch (conState) {
        case 'disconnected':
        case 'failed':
          console.log('failed to connect to host, retrying...');
          this.joinGame();
          break;
      }
    };

    this.gameState.otherPlayer.on('open', () => {
      console.log('connected to host');
      this.gameState.otherPlayer.on('data', (data: any) =>
        this.gameState.receiveMessage(JSON.parse(data))
      );

      this.menuOpen = true;
    });
  }
}