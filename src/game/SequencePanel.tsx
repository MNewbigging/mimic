import { observer } from 'mobx-react';
import React from 'react';
import { GameState, PlayerStatus } from '../GameState';

import './sequence-panel.scss';

interface SequenceProps {
  state: GameState;
}

@observer
export class SequencePanel extends React.PureComponent<SequenceProps> {
  private readonly itemSize = 30;
  private readonly maxRowLength = 8;
  private readonly maxRows = 3;
  private readonly itemMargin = 5;

  public render() {
    const { state } = this.props;

    // Get the size of the panel
    const panelStyle = this.getPanelStyle();

    return (
      <div className={'sequence-panel'} style={panelStyle}>
        {this.renderItems()}
      </div>
    );
  }

  private renderItems() {
    const { state } = this.props;
    const items: JSX.Element[] = [];
    const sequence = this.getSequence();
    // render the items that exist in sequence array
    sequence.forEach((seq, i) => {
      items.push(
        <div
          key={`seq-item-${i}`}
          className={`item ${seq}`}
          onClick={() => state.removeFromSequence()}
        ></div>
      );
    });

    // make up difference to round count with empties
    const difference = state.round - sequence.length;
    for (let i = 0; i < difference; i++) {
      items.push(<div key={`empty-item-${i}`} className={'item empty'}></div>);
    }

    return items;
  }

  /**
   * When are sequences valid:
   * PLAYING_SEQ - yourSequence
   * PLAYING_RESP - yourSequence
   * WAITING_SEQ - nothing (your last seq already gone)
   * WAITING_RESP - yourSequence
   */
  private readonly getSequence = () => {
    const { state } = this.props;

    switch (state.yourPlayerStatus) {
      case PlayerStatus.PLAYING_SEQUENCE:
      case PlayerStatus.PLAYING_RESPONSE:
      case PlayerStatus.WAITING_RESPONSE:
        return state.yourSequence;
      default:
        return [];
    }
  };

  private getPanelStyle() {
    const { state } = this.props;

    // Check the length - based on round since sequence might not have stuff in it yet
    const itemsCount = state.round;

    // If game not started, size is 0
    if (itemsCount === 0) {
      return {
        width: '0px',
        height: '0px',
        border: 'none',
      };
    }

    // Otherwise, work out what panel size should be (+2 accounts for border - box-sizing on)
    const w = this.getPanelWidth(itemsCount) + 2;
    const h = this.getPanelHeight(itemsCount) + 2;

    return {
      width: `${w}px`,
      height: `${h}px`,
    };
  }

  private getPanelWidth(items: number) {
    // Items themselves
    const itemsInRow = items > this.maxRowLength ? this.maxRowLength : items;
    const rowWidth = itemsInRow * this.itemSize;
    // Account for scrollbar
    const rows = Math.ceil(items / this.maxRowLength);
    const scrollOffset = rows > 3 ? 15 : 0;

    // Account for margins
    return rowWidth + scrollOffset + (itemsInRow + 1) * this.itemMargin;
  }

  private getPanelHeight(items: number) {
    const rows = Math.ceil(items / this.maxRowLength);
    const rowHeight = rows > this.maxRows ? this.itemSize * this.maxRows : this.itemSize * rows;
    return rowHeight + (rows + 1) * this.itemMargin;
  }
}
