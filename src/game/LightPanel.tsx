import { observer } from 'mobx-react';
import React from 'react';

import './light-panel.scss';

interface LPProps {
  interactive: boolean; // whether can click on it (if not, it's playing sth or game hasn't started)
}

@observer
export class LightPanel extends React.PureComponent {
  public componentDidMount() {}

  public render() {
    return (
      <div className={'light-panel'}>
        <div
          id={'r'}
          className={'light red'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'r')}
        ></div>
        <div
          id={'g'}
          className={'light green'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'g')}
        ></div>
        <div
          id={'b'}
          className={'light blue'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'b')}
        ></div>
        <div
          id={'o'}
          className={'light orange'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'o')}
        ></div>
        <div
          id={'p'}
          className={'light purple'}
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => this.onAnimationEnd(e, 'p')}
        ></div>
      </div>
    );
  }

  private readonly onAnimationEnd = (_e: React.AnimationEvent<HTMLDivElement>, id: string) => {
    document.getElementById(id).classList.remove('flash');
  };
}
