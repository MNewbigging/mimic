import { action, observable } from 'mobx';

export class MimicState {
  @observable public menuOpen = false;
  @observable public name = '';
  @observable public hostId = '';
  @observable public joinId = '';

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
  }

  public joinGame() {
    console.log('joining game');
  }
}
