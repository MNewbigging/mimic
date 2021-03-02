import { observer } from 'mobx-react';
import React from 'react';
import { Button } from '../core/Button';

import { Dialog } from '../core/Dialog';
import { Dialogs, dialogState } from '../core/DialogState';

import './help-dialog.scss';

@observer
export class HelpDialog extends React.PureComponent {
  public render() {
    return (
      <Dialog
        type={Dialogs.HELP}
        title={'HOW TO PLAY'}
        content={this.renderContent()}
        actionRail={this.renderActionRail()}
        canClickOutsideClose
      />
    );
  }

  private renderContent() {
    return (
      <div>
        <p>Mimic is a simple sequence-matching game. Here's how to play it:</p>

        <ul>
          <li className={'r'}>
            Each round, both players take turns to create a sequence and a response by clicking on
            the central light panel
          </li>
          <li className={'g'}>
            A sequence can be any combination of lights - each sequence must be as long as the
            current roud number
          </li>
          <li className={'b'}>
            A response must match the exact order of lights of the sequence that came before it, or
            you lose the game
          </li>
          <li className={'o'}>
            For exmaple, Player 1 makes the first sequence - then Player 2 has to respond with a
            matching sequence. If they get it right, it's then their turn to make a sequence.
          </li>
          <li className={'p'}>
            Once both players have made a sequence and a response, the next round starts and the
            sequences get longer
          </li>
        </ul>

        <p>
          When making a sequence, you'll see your current sequence below the light panel. Clicking
          on any lights there will remove the <i>last</i> light from your current sequence.
        </p>
      </div>
    );
  }

  private renderActionRail() {
    return (
      <div>
        <Button text={'Got it!'} onClick={() => dialogState.hideDialog()} />
      </div>
    );
  }
}
