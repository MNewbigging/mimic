import { observer } from 'mobx-react';
import React from 'react';

import { Button } from '../core/Button';
import { TextInput } from '../core/TextInput';
import { MimicState } from '../MimicState';

import './main-menu.scss';

interface MenuProps {
  mState: MimicState;
}

@observer
export class MainMenu extends React.PureComponent<MenuProps> {
  public render() {
    const { mState } = this.props;
    const panelClass = mState.menuOpen ? 'open' : 'closed';

    return (
      <>
        <div className={'panel left ' + panelClass}>
          <div className={'form'}>
            <div className={'header'}>HOST</div>
            <div className={'body'}>
              <div>Name</div>
              <TextInput text={mState.name} onChange={(text: string) => mState.setName(text)} />
              <div>Host id</div>
              <TextInput text={mState.hostId} />
            </div>
            <div className={'footer'}>
              <Button
                text={'Host game'}
                onClick={() => mState.hostGame()}
                disabled={mState.name.length === 0}
              />
            </div>
          </div>
        </div>
        <div className={'panel right ' + panelClass}>
          <div className={'form'}>
            <div className={'header'}>JOIN</div>
            <div className={'body'}>
              <div>Name</div>
              <TextInput text={mState.name} onChange={(text: string) => mState.setName(text)} />
              <div>Host id</div>
              <TextInput text={mState.joinId} onChange={(text: string) => mState.setJoinId(text)} />
            </div>
            <div className={'footer'}>
              <Button
                text={'Join game'}
                onClick={() => mState.joinGame()}
                disabled={mState.name.length === 0 || mState.joinId.length === 0}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}