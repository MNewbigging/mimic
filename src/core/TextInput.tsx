import { observer } from 'mobx-react';
import React from 'react';

import './text-input.scss';

interface InputProps {
  text: string;
  onChange?: (text: string) => void;
  readonly?: boolean;
}

@observer
export class TextInput extends React.PureComponent<InputProps> {
  public render() {
    const { text, readonly } = this.props;
    return (
      <input
        className={'text-input'}
        type={'text'}
        value={text}
        readOnly={readonly ?? false}
        onChange={this.onChange}
        autoComplete={'new-password'}
      />
    );
  }

  private readonly onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { readonly, onChange } = this.props;
    if (!readonly) {
      onChange(e.target.value);
    }
  };
}
