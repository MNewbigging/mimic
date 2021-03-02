import { observer } from 'mobx-react';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import { Alert } from './core/Alert';
import { alerter } from './core/Alerter';
import { GameScreen } from './game/GameScreen';
import { MainMenu } from './main-menu/MainMenu';
import { MimicState } from './MimicState';

@observer
export class Mimic extends React.PureComponent {
  private readonly mState = new MimicState();
  public render() {
    this.parseUrlHash();

    return (
      <>
        <Alert
          open={alerter.alertShowing}
          title={alerter.alertTitle}
          content={alerter.alertContent}
        />
        <HashRouter>
          <Switch>
            <Route render={() => <MainMenu mState={this.mState} />} />
          </Switch>
        </HashRouter>
        {this.mState.gameState && <GameScreen state={this.mState.gameState} />}
      </>
    );
  }

  private parseUrlHash() {
    const query = window.location.hash;
    // See if we've been given a join id
    // If so, url will be of format: base/#/joinId=123joinId456
    const splitQuery = query.split('=');
    if (splitQuery.length === 2) {
      const joinId = splitQuery[1];
      this.mState.setJoinId(joinId);
    }
  }
}
