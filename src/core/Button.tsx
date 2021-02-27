import React from 'react';

import './button.scss';

interface ButtonProps {
  text?: string;
  onClick: () => void;
  disabled?: boolean;
}

export class Button extends React.PureComponent<ButtonProps> {
  public render() {
    const { text, onClick, disabled } = this.props;
    const btnText = text ?? '';

    return (
      <button className={'button'} type={'button'} onClick={onClick} disabled={disabled ?? false}>
        {btnText}
      </button>
    );
  }
}
