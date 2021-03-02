import { action, observable } from 'mobx';

export enum AlertDuration {
  QUICK = 1500,
  NORMAL = 2500,
  LONG = 5000,
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

  @action public showAlert(alertProps: AlertProps) {
    this.alertTitle = alertProps.title ?? '';
    this.alertContent = alertProps.content;
    this.alertShowing = true;

    setTimeout(() => {
      this.hideAlert();
      if (alertProps.onHide) {
        setTimeout(() => alertProps.onHide(), 300);
      }
    }, alertProps.duration);
  }

  private readonly hideAlert = () => {
    this.alertShowing = false;
  };
}

export const alerter = new Alerter();
