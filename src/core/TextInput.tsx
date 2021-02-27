import React from 'react';

import './text-input.scss';

export class TextInput extends React.PureComponent {
  public render() {
    return <input className={'text-input'} type={'text'} />;
  }
}
