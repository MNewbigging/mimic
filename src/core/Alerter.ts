import { action, observable } from 'mobx';

export enum AlertDuration {
  QUICK = 1500,
  NORMAL = 2500,
  FOREVER = 0,
}

class Alerter {
  @observable public alertTitle = '';
  @observable public alertContent = '';
  @observable public alertShowing = false;
  @observable public gameOverAlert = false;

  @action public showAlert(duration: AlertDuration, content: string, title = '') {
    this.alertTitle = title;
    this.alertContent = content;
    this.alertShowing = true;

    if (duration !== AlertDuration.FOREVER) {
      setTimeout(this.hideAlert, duration);
    }
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
