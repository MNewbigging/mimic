import { action, observable } from 'mobx';

export enum AlertDuration {
  QUICK = 1500,
  NORMAL = 2500,
}

export interface AlertProps {
  title?: string;
  content: string;
  duration: AlertDuration;
  onHide?: () => void;
}

class Alerter {
  @observable public alertTitle = '';
  @observable public alertContent = '';
  @observable public alertShowing = false;

  // TODO - Don't like this
  @observable public gameOverAlert = false;

  @action public showAlert(alertProps: AlertProps) {
    this.alertTitle = alertProps.title ?? '';
    this.alertContent = alertProps.content;
    this.alertShowing = true;

    setTimeout(() => {
      this.hideAlert();
      alertProps.onHide();
    }, alertProps.duration);
  }

  @action public showGameOverAlert(content: string, title: string) {
    this.alertTitle = title;
    this.alertContent = content;
    this.alertShowing = true;
    this.gameOverAlert = true;
  }

  @action public closeGameOverAlert() {
    this.alertShowing = false;
    this.gameOverAlert = false;
  }

  private readonly hideAlert = () => {
    this.alertShowing = false;
  };
}

export const alerter = new Alerter();
