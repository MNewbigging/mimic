import { action, observable } from 'mobx';
import Peer from 'peerjs';

import { AlertDuration, alerter } from './core/Alerter';
import { GameUtils } from './game/GameUtils';
import {
  BaseMessage,
  InitMessage,
  MessageType,
  NameMessage,
  ResetMessage,
  ResponseMessage,
  SequenceMessage,
} from './Messages';

// Just used for display
export enum PlayerStatus {
  JOINING = 'JOINING...',
  DISCONNECTED = 'DISCONNECTED',
}

// Various states a player can be in on any given turn
enum PlayerTurnStates {
  NEXT_ROUND = 'NEXT ROUND',
  PLAY_SEQ = 'PLAYING SEQUENCE',
  WAIT_RESP = 'WAITING FOR RESPONSE',
  WAIT_SEQ = 'WAITING FOR SEQUENCE',
  PLAY_RESP = 'PLAYING RESPONSE',
}

const HostTurnStatesArray = [
  PlayerTurnStates.NEXT_ROUND,
  PlayerTurnStates.PLAY_SEQ,
  PlayerTurnStates.WAIT_RESP,
  PlayerTurnStates.WAIT_SEQ,
  PlayerTurnStates.PLAY_RESP,
];

const JoinTurnStatesArray = [
  PlayerTurnStates.NEXT_ROUND,
  PlayerTurnStates.WAIT_SEQ,
  PlayerTurnStates.PLAY_RESP,
  PlayerTurnStates.PLAY_SEQ,
  PlayerTurnStates.WAIT_RESP,
];

export class GameState {
  // Current player props
  public yourPlayer: Peer;
  public yourPlayerName: string;
  @observable public yourSequence: string[] = [];
  public yourTurnStates: string[] = [];
  @observable public yourCurrentTurnState = 'WAITING';
  private youAreHost = false;

  // Other player props
  public otherPlayer?: Peer.DataConnection;
  @observable public otherPlayerName = '';
  @observable public otherPlayerState = 'WAITING';
  @observable public otherSequence: string[] = [];

  // Game props
  @observable public roundText = '';
  @observable public helpText = '';
  @observable public showSequencePanel = false;
  @observable public round = 0;
  @observable public lightPanelActive = false;

  constructor(yourPlayer: Peer, yourPlayerName: string, startingRound?: number) {
    this.yourPlayer = yourPlayer;
    this.yourPlayerName = yourPlayerName;
    // Only host can set starting round
    this.round = startingRound ? startingRound - 1 : 0;
  }

  // Called when both players are connected and ready to start game
  public readyUp(host: boolean) {
    this.youAreHost = host;
    // Initialise player turn state based on whether they're host or not
    // Put to last item, so when we start it'll move to first item
    if (host) {
      this.yourTurnStates = HostTurnStatesArray;
      this.yourCurrentTurnState = HostTurnStatesArray[HostTurnStatesArray.length - 1];
    } else {
      this.yourTurnStates = JoinTurnStatesArray;
      this.yourCurrentTurnState = JoinTurnStatesArray[JoinTurnStatesArray.length - 1];
    }

    // Then kick off game
    setTimeout(() => this.nextTurnState(), 1000);
  }

  @action public receiveMessage(message: BaseMessage) {
    switch (message.type) {
      case MessageType.INIT:
        const initMsg = message as InitMessage;
        this.otherPlayerName = initMsg.hostName;
        this.round = initMsg.startRound;
        this.readyUp(false);
        break;
      case MessageType.SEQUENCE:
        this.otherSequence = (message as SequenceMessage).sequence;
        this.playSequence(this.otherPlayerName, this.otherSequence);
        break;
      case MessageType.RESPONSE:
        this.otherSequence = (message as ResponseMessage).sequence;
        this.playResponse(this.otherPlayerName, this.otherSequence);
        break;
      case MessageType.RESET:
        alerter.closeGameOverAlert();
        this.round = (message as ResetMessage).round;
        this.readyUp(this.youAreHost);
        break;
    }
  }

  @action public addToSequence(id: string) {
    if (this.yourSequence.length < this.round) {
      this.yourSequence.push(id);
    }
  }

  @action public removeFromSequence() {
    this.yourSequence.pop();
  }

  public submitSequence() {
    // Prevent further interaction with light panel immediately
    this.lightPanelActive = false;

    // Are we submitting a new sequence or a response to one?
    switch (this.yourCurrentTurnState) {
      case PlayerTurnStates.PLAY_SEQ:
        // Send sequence to other player so they can respond
        const seqMsg = new SequenceMessage(this.yourSequence);
        this.otherPlayer?.send(JSON.stringify(seqMsg));
        // Start playback of your sequence
        this.playSequence(this.yourPlayerName, this.yourSequence);
        break;
      case PlayerTurnStates.PLAY_RESP:
        // Send response sequence to other player to view
        const respMsg = new ResponseMessage(this.yourSequence);
        this.otherPlayer?.send(JSON.stringify(respMsg));
        // Start playback of your response
        this.playResponse(this.yourPlayerName, this.yourSequence);
        break;
    }
  }

  @action public replayGame(fromStart: boolean) {
    // Close the game over alert
    alerter.closeGameOverAlert();
    // Reset for a new game
    this.round = fromStart ? 0 : this.round - 1;
    // Tell other player to reset as well
    const resetMsg = new ResetMessage(this.round);
    this.otherPlayer?.send(JSON.stringify(resetMsg));
    // Then restart
    this.readyUp(this.youAreHost);
  }

  private nextTurnState() {
    // Move to next turn state
    this.incrementTurnState();

    // Then action it
    this.actionNewTurnState();
  }

  private incrementTurnState() {
    // Need to move your turn state along by 1, loop if at end
    const idx = this.yourTurnStates.indexOf(this.yourCurrentTurnState);
    let newIdx = idx + 1;
    if (newIdx === this.yourTurnStates.length) {
      newIdx = 0;
    }
    this.yourCurrentTurnState = this.yourTurnStates[newIdx];
  }

  @action private actionNewTurnState() {
    switch (this.yourCurrentTurnState) {
      case PlayerTurnStates.NEXT_ROUND:
        // Update light panel
        this.lightPanelActive = false;
        // Update sequence panel
        this.showSequencePanel = false;
        // Slight delay before next round
        setTimeout(() => this.nextRound(), 1000);
        break;
      case PlayerTurnStates.PLAY_SEQ:
        // Update help text
        this.helpText = `${this.otherPlayerName} is waiting for your sequence`;
        // Update other player state
        this.otherPlayerState = PlayerTurnStates.WAIT_SEQ;
        // Update light panel
        this.lightPanelActive = true;
        // Update sequence panel
        this.showSequencePanel = true;
        // Clear previous sequence
        this.yourSequence = [];
        // Player then builds their sequence, and calls submitSequence when done
        // That will call playSequence, which calls nextTurnState on playback end
        break;
      case PlayerTurnStates.WAIT_SEQ:
        // Update help text
        this.helpText = `${this.otherPlayerName} is making their sequence`;
        // Update other player state
        this.otherPlayerState = PlayerTurnStates.PLAY_SEQ;
        // Update light panel
        this.lightPanelActive = false;
        // Update sequence panel
        this.showSequencePanel = false;
        // On receiving a sequence message, will call playSequence
        // That calls nextTurnState on playback end
        break;
      case PlayerTurnStates.PLAY_RESP:
        // Update help text
        this.helpText = `${this.otherPlayerName} is waiting for your response`;
        // Update other player state
        this.otherPlayerState = PlayerTurnStates.WAIT_RESP;
        // Update light panel
        this.lightPanelActive = true;
        // Update sequence panel
        this.showSequencePanel = true;
        // Clear previous sequence
        this.yourSequence = [];
        // Player then builds response, and calls submitSequence when done
        // That will call playResponse, which calls nextTurnState on playback end (if game didn't end)
        break;
      case PlayerTurnStates.WAIT_RESP:
        // Update help text
        this.helpText = `${this.otherPlayerName} is making their response`;
        // Update other player state
        this.otherPlayerState = PlayerTurnStates.PLAY_RESP;
        // Update light panel
        this.lightPanelActive = false;
        // Update sequence panel
        this.showSequencePanel = true;
        // On receive a response message, will call playResponse
        // That calls nextTurnState on playback end (if game didn't end)
        break;
    }
  }

  @action private nextRound() {
    this.round++;
    const title = `ROUND ${this.round}`;
    this.roundText = title;
    const starter = this.youAreHost ? this.yourPlayerName : this.otherPlayerName;

    alerter.showAlert({
      title,
      content: `${starter} goes first`,
      duration: AlertDuration.NORMAL,
      onHide: () => this.nextTurnState(),
    });
  }

  @action private playSequence(name: string, sequence: string[]) {
    // This shows the alert - when alert hides it starts playback -
    // when that's done it moves to next turn state
    alerter.showAlert({
      title: 'New sequence!',
      content: `${name}'s sequence...`,
      duration: AlertDuration.NORMAL,
      onHide: () => {
        GameUtils.flashLight(0, sequence, () => {
          this.nextTurnState();
        });
      },
    });
  }

  @action private playResponse(name: string, sequence: string[]) {
    // This shows the alert - when that hides it starts playback -
    // when that's done it checks for game over in onResponseEnd
    alerter.showAlert({
      title: 'New response!',
      content: `${name}'s response...`,
      duration: AlertDuration.NORMAL,
      onHide: () => {
        GameUtils.flashLight(0, sequence, this.onResponseEnd);
      },
    });
  }

  private readonly onResponseEnd = () => {
    // Check for game over
    const match = GameUtils.doSequencesMatch(this.yourSequence, this.otherSequence);
    if (!match) {
      setTimeout(() => this.showGameOver(), 1000);
    } else {
      this.nextTurnState();
    }
  };

  private showGameOver() {
    const title = 'GAME OVER!';

    const winner =
      this.yourCurrentTurnState === PlayerTurnStates.PLAY_RESP
        ? this.otherPlayerName
        : this.yourPlayerName;

    const content = `${winner} won!`;
    alerter.showGameOverAlert(content, title);
  }
}
