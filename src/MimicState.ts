import { action, observable } from 'mobx';
import Peer from 'peerjs';

import { GameState, PlayerStatus } from './GameState';
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

  // Handle all pre-game setup and state here
  @action public hostGame() {
    this.gameState = new GameState(this.peer, this.name);

    // Host expects incoming connection
    this.peer.on('connection', (conn: Peer.DataConnection) => {
      this.gameState.otherPlayerName = conn.label;
      this.gameState.otherPlayerState = PlayerStatus.JOINING;

      conn.on('open', () => {
        // Handle disconnect of joiner
        // TODO - also show alert on disconnect
        conn.peerConnection.onconnectionstatechange = (_ev: Event) => {
          if (conn.peerConnection.connectionState === 'disconnected') {
            this.gameState.otherPlayerState = PlayerStatus.DISCONNECTED;
          }
        };
        conn.on('close', () => (this.gameState.otherPlayerState = PlayerStatus.DISCONNECTED));
        conn.on('data', (data: any) => this.gameState.receiveMessage(JSON.parse(data)));

        this.gameState.otherPlayer = conn;

        // Send joiner initial message with host name for their display
        const nameMsg = new NameMessage(this.name);
        conn.send(JSON.stringify(nameMsg));

        // Ready to start the game
        this.gameState.readyUp(true);
      });
    });

    this.menuOpen = true;
  }

  @action public joinGame() {
    this.gameState = new GameState(this.peer, this.name);

    // Connect to given host id
    const conn = this.peer.connect(this.joinId, { label: this.name });

    // Handle the inevitable first failure
    conn.peerConnection.onconnectionstatechange = (_ev: Event) => {
      const connState = conn.peerConnection.connectionState;
      switch (connState) {
        case 'disconnected':
        case 'failed':
          console.log('failed to connect to host, retrying...');
          this.joinGame();
          break;
      }
    };

    conn.on('open', () => {
      console.log('connected to host');
      this.gameState.otherPlayer = conn;
      this.gameState.otherPlayer.on('data', (data: any) =>
        this.gameState.receiveMessage(JSON.parse(data))
      );
      this.gameState.readyUp(false);
      this.menuOpen = true;
    });
  }
}
