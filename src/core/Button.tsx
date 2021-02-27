import React from 'react';

import './button.scss';

interface ButtonProps {
  text?: string;
}

export class Button extends React.PureComponent<ButtonProps> {
  public render() {
    const { text } = this.props;
    const btnText = text ?? '';

    return (
      <button className={'button'} type={'button'}>
        {btnText}
      </button>
    );
  }
}
