import { action, observable } from 'mobx';

class Alerter {
  @observable alertContent = '';
  @observable alertShowing = false;

  @action public showAlert(content: string) {
    this.alertContent = content;
    this.alertShowing = true;

    setTimeout(this.hideAlert, 2500);
  }

  private readonly hideAlert = () => {
    this.alertShowing = false;
  };
}

export const alerter = new Alerter();
