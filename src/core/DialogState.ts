import { action, observable } from 'mobx';

export enum Dialogs {
  NONE,
  GAME_OVER,
}

class DialogState {
  @observable activeDialog = Dialogs.NONE;

  @action showDialog(dialog: Dialogs) {
    this.activeDialog = dialog;
  }

  @action hideDialog() {
    this.activeDialog = Dialogs.NONE;
  }
}

export const dialogState = new DialogState();
