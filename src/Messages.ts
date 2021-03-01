// tslint:disable: max-classes-per-file

export enum MessageType {
  NAME = 'name',
  ROUND = 'round',
  SEQUENCE = 'sequence',
  RESPONSE = 'response',
  RESET = 'reset',
}

export abstract class BaseMessage {
  constructor(public type: MessageType) {}
}

export class NameMessage extends BaseMessage {
  constructor(public name: string) {
    super(MessageType.NAME);
  }
}

export class RoundMessage extends BaseMessage {
  constructor(public round: number) {
    super(MessageType.ROUND);
  }
}

export class SequenceMessage extends BaseMessage {
  constructor(public sequence: string[]) {
    super(MessageType.SEQUENCE);
  }
}

export class ResponseMessage extends BaseMessage {
  constructor(public sequence: string[]) {
    super(MessageType.RESPONSE);
  }
}

export class ResetMessage extends BaseMessage {
  constructor(public round: number) {
    super(MessageType.RESET);
  }
}
