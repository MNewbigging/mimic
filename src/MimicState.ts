import { action, observable } from 'mobx';

import Peer from 'peerjs';

export class MimicState {
  // Menu props
  @observable public menuOpen = true;
  @observable public name = '';
  @observable public hostId = '';
  @observable public joinId = '';

  // Player props
  public peer: Peer;
  @observable ready = false;

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

  public hostGame() {
    console.log('hosting game');

    // Host enters game immediately
    this.ready = true;
    this.menuOpen = true;
  }

  public joinGame() {
    console.log('joining game');
  }
}
