// tslint:disable: max-classes-per-file

export enum MessageType {
  NAME = 'name',
}

export abstract class BaseMessage {
  constructor(public type: MessageType) {}
}

export class NameMessage extends BaseMessage {
  constructor(public name: string) {
    super(MessageType.NAME);
  }
}
