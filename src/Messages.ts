// tslint:disable: max-classes-per-file

import { PlayerStatus } from './GameState';

export enum MessageType {
  NAME = 'name',
  CONFIRM = 'confirm',
  STATUS = 'status',
  ROUND = 'round',
}

export abstract class BaseMessage {
  constructor(public type: MessageType) {}
}

export class NameMessage extends BaseMessage {
  constructor(public name: string) {
    super(MessageType.NAME);
  }
}

export class ConfirmMessage extends BaseMessage {
  constructor() {
    super(MessageType.CONFIRM);
  }
}

export class StatusMessage extends BaseMessage {
  constructor(public status: PlayerStatus) {
    super(MessageType.STATUS);
  }
}

export class RoundMessage extends BaseMessage {
  constructor(public round: number) {
    super(MessageType.ROUND);
  }
}
