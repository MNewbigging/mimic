import React from 'react';

import './button.scss';

interface ButtonProps {
  text?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export class Button extends React.PureComponent<ButtonProps> {
  public render() {
    const { text, onClick, disabled, loading } = this.props;
    const btnText = text ?? '';
    const loadingText = 'Loading...';

    return (
      <button className={'button'} type={'button'} onClick={onClick} disabled={disabled ?? false}>
        {loading ? loadingText : btnText}
      </button>
    );
  }
}
