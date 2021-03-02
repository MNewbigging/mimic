import { action, observable } from 'mobx';
import Peer from 'peerjs';
import { AlertDuration, alerter } from './core/Alerter';
import { Dialogs, dialogState } from './core/DialogState';

import { GameState, PlayerStatus } from './GameState';
import { InitMessage } from './Messages';

export class MimicState {
  // Menu props
  @observable public menuOpen = false;
  @observable public name = '';
  @observable public hostId = '';
  @observable public joinId = '';
  @observable public joining = false;
  @observable public startingRound = 1;

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

  @action public setJoinId(id: string) {
    this.joinId = id;
  }

  @action public setStartingRound(round: number) {
    this.startingRound = round;
  }

  public disableHostButton() {
    // If there isn't a valid name
    // Or if we're currently joining a game

    return this.name.length === 0 || this.joining;
  }

  public disableJoinbutton() {
    return this.disableHostButton() || this.joinId.length === 0;
  }

  @action public hostGame() {
    this.gameState = new GameState(this.peer, this.name, this.startingRound);

    // Host expects incoming connection
    this.peer.on('connection', (conn: Peer.DataConnection) => {
      this.gameState.otherPlayerName = conn.label;
      this.gameState.otherPlayerState = PlayerStatus.JOINING;

      conn.on('open', () => {
        // Handle disconnect of joiner
        conn.peerConnection.onconnectionstatechange = (_ev: Event) => {
          if (conn.peerConnection.connectionState === 'disconnected') {
            this.onOtherDisconnect();
          }
        };
        conn.on('close', () => this.onOtherDisconnect());
        conn.on('data', (data: any) => this.gameState.receiveMessage(JSON.parse(data)));

        this.gameState.otherPlayer = conn;

        // Send joiner init message for their game setup
        const initMsg = new InitMessage(this.name, this.startingRound - 1);
        conn.send(JSON.stringify(initMsg));

        // Ready to start the game
        this.gameState.readyUp(true);
      });
    });

    this.menuOpen = true;
  }

  @action public joinGame() {
    this.joining = true;
    this.gameState = new GameState(this.peer, this.name);

    // Connect to given host id
    const conn = this.peer.connect(this.joinId, { label: this.name });

    // Handle invalid host id
    this.peer.on('error', () => this.invalidHostId());

    // Handle the inevitable first failure
    conn.peerConnection.onconnectionstatechange = (_ev: Event) => {
      const connState = conn.peerConnection.connectionState;
      switch (connState) {
        case 'disconnected':
          this.onOtherDisconnect();
          break;
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

      this.menuOpen = true;
    });
  }

  private onOtherDisconnect() {
    this.gameState.otherPlayerState = PlayerStatus.DISCONNECTED;
    alerter.showAlert({
      title: 'GAME OVER',
      content: `${this.gameState.otherPlayerName} has disconnected`,
      duration: AlertDuration.LONG,
    });
  }

  private invalidHostId() {
    this.joining = false;
    alerter.showAlert({
      title: 'Uh oh!',
      content: 'Cannot connect to that host - are you sure it is correct?',
      duration: AlertDuration.NORMAL,
    });
  }
}
