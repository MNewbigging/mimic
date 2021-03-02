import { observer } from 'mobx-react';
import React from 'react';

import { Button } from '../core/Button';
import { TextInput } from '../core/TextInput';
import { MimicState } from '../MimicState';

import ShareBtn from '../../dist/share.svg';

import './main-menu.scss';
import { AlertDuration, alerter } from '../core/Alerter';

interface MenuProps {
  mState: MimicState;
}

@observer
export class MainMenu extends React.Component<MenuProps> {
  public render() {
    const { mState } = this.props;
    const panelClass = mState.menuOpen ? 'open' : 'closed';

    return (
      <>
        <div className={'panel left ' + panelClass}>
          <div className={'form'}>
            <div className={'header heading'}>HOST</div>
            <div className={'body'}>
              <div className={'label'}>Name</div>
              <TextInput text={mState.name} onChange={(text: string) => mState.setName(text)} />
              <div className={'label'}>Host id</div>
              <div className={'host-id'}>
                <TextInput text={mState.hostId} />
                <button className={'share-btn'} onClick={() => this.copyToClipboard()}>
                  <ShareBtn />
                </button>
              </div>

              <div className={'label'}>Starting round</div>
              <input
                className={'round-input'}
                type={'number'}
                value={mState.startingRound}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  mState.setStartingRound(parseInt(e.target.value, 10))
                }
                min={1}
              />
            </div>
            <div className={'footer'}>
              <Button
                text={'Host game'}
                onClick={() => mState.hostGame()}
                disabled={mState.disableHostButton()}
              />
            </div>
          </div>
        </div>
        <div className={'panel right ' + panelClass}>
          <div className={'form'}>
            <div className={'header heading'}>JOIN</div>
            <div className={'body'}>
              <div className={'label'}>Name</div>
              <TextInput text={mState.name} onChange={(text: string) => mState.setName(text)} />
              <div className={'label'}>Host id</div>
              <TextInput text={mState.joinId} onChange={(text: string) => mState.setJoinId(text)} />
            </div>
            <div className={'footer'}>
              <Button
                text={'Join game'}
                onClick={() => mState.joinGame()}
                disabled={mState.disableJoinbutton()}
                loading={mState.joining}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  private async copyToClipboard() {
    try {
      const inviteLink = `https://mnewbigging.github.io/mimic/#/joinId=${this.props.mState.hostId}`;
      await navigator.clipboard.writeText(inviteLink);
      alerter.showAlert({
        title: '',
        content: 'Invite link copied!',
        duration: AlertDuration.QUICK,
      });
    } catch (err) {
      console.log('could not copy to cb', err);
    }
  }
}
