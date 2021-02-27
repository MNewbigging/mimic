import React from 'react';

import { MainMenu } from './main-menu/MainMenu';

export class Mimic extends React.PureComponent {
  public render() {
    return (
      <>
        <MainMenu />
        <div>Mimic</div>
      </>
    );
  }
}
