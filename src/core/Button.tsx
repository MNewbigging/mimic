import React from 'react';

import './button.scss';

interface ButtonProps {
  text?: string;
  onClick: () => void;
}

export class Button extends React.PureComponent<ButtonProps> {
  public render() {
    const { text, onClick } = this.props;
    const btnText = text ?? '';

    return (
      <button className={'button'} type={'button'} onClick={onClick}>
        {btnText}
      </button>
    );
  }
}
