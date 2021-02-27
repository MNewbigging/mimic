import { observer } from 'mobx-react';
import React from 'react';

import './light-panel.scss';

interface LPProps {
  active: boolean;
  onClick: (id: string) => void;
}

@observer
export class LightPanel extends React.PureComponent<LPProps> {
  public render() {
    const { active, onClick } = this.props;
    const activeClass = active ? 'active' : 'inactive';

    return (
      <div className={'light-panel ' + activeClass}>
        <div
          id={'r'}
          className={'light red'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'r')}
          onClick={() => onClick('r')}
        ></div>
        <div
          id={'g'}
          className={'light green'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'g')}
          onClick={() => onClick('g')}
        ></div>
        <div
          id={'b'}
          className={'light blue'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'b')}
          onClick={() => onClick('b')}
        ></div>
        <div
          id={'o'}
          className={'light orange'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'o')}
          onClick={() => onClick('o')}
        ></div>
        <div
          id={'p'}
          className={'light purple'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'p')}
          onClick={() => onClick('p')}
        ></div>
      </div>
    );
  }

  private readonly onAnimationEnd = (_e: React.AnimationEvent<HTMLDivElement>, id: string) => {
    document.getElementById(id).classList.remove('flash');
  };
}
