import { observer } from 'mobx-react';
import React from 'react';

import './alert.scss';
import { Button } from './Button';

interface AlertProps {
  open: boolean;
  title: string;
  content: string;
  showEndGameBtns?: boolean;
  onReplayClick: (start: boolean) => void;
}

@observer
export class Alert extends React.PureComponent<AlertProps> {
  public render() {
    const { open, title, content, showEndGameBtns, onReplayClick } = this.props;
    const openClosed = open ? 'open' : 'closed';

    return (
      <div className={'alert ' + openClosed}>
        {title && <div className={'heading'}>{title}</div>}
        <div className={'content'}>{content}</div>
        {showEndGameBtns && (
          <div className={'endgame-buttons'}>
            Replay:
            <Button text={'Round 1'} onClick={() => onReplayClick(true)} />
            <Button text={'Last round'} onClick={() => onReplayClick(false)} />
          </div>
        )}
      </div>
    );
  }
}
