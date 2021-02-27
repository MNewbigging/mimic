import React from 'react';

import { Button } from '../core/Button';
import { TextInput } from '../core/TextInput';

import './main-menu.scss';

export class MainMenu extends React.PureComponent {
  public render() {
    return (
      <>
        <div className={'panel left'}>
          <div className={'form'}>
            <div className={'header'}>HOST</div>
            <div className={'body'}>
              <div>Name</div>
              <TextInput />
              <div>Host id</div>
              <TextInput />
            </div>
            <div className={'footer'}>
              <Button text={'Host game'} />
            </div>
          </div>
        </div>
        <div className={'panel right'}>
          <div className={'form'}>
            <div className={'header'}>JOIN</div>
            <div className={'body'}>
              <div>Name</div>
              <TextInput />
              <div>Host id</div>
              <TextInput />
            </div>
            <div className={'footer'}>
              <Button text={'Join game'} />
            </div>
          </div>
        </div>
      </>
    );
  }
}
