import { action, observable } from 'mobx';

export enum AlertDuration {
  QUICK = 1500,
  NORMAL = 2500,
  LONG = 5000,
}

class Alerter {
  @observable public alertTitle = '';
  @observable public alertContent = '';
  @observable public alertShowing = false;

  @action public showAlert(duration: AlertDuration, content: string, title = '') {
    this.alertTitle = title;
    this.alertContent = content;
    this.alertShowing = true;

    setTimeout(this.hideAlert, duration);
  }

  private readonly hideAlert = () => {
    this.alertShowing = false;
  };
}

export const alerter = new Alerter();
