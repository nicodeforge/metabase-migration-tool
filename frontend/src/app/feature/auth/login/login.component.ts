import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponseData, AuthService } from '../services/auth.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../dto/create-user.dto';

enum FormModeEnum {
  'login' = 'login',
  'signup' = 'signup',
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public formMode: FormModeEnum = FormModeEnum.login;
  public formName: string = 'Login';

  private isLoading: boolean = false;
  private error!: string;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;

    const email = form.value.email;
    const password = form.value.password;

    let authObservable!: Observable<AuthResponseData>;

    if (this.formMode === FormModeEnum.login) {
      console.log(`Login mode`);
      authObservable = this.auth.signIn(email, password);
    } else {
      const name = form.value.name;

      const userToCreate: CreateUserDto = { name, email, password };

      authObservable = this.auth.signUp(userToCreate);
    }

    authObservable.subscribe(
      async () => {
        this.isLoading = false;
        await this.router.navigateByUrl('/instance');
      },
      (errorMessage: any) => {
        this.error = errorMessage;
        alert(this.error);
        this.isLoading = false;
      }
    );
  }

  public onSwitchFormMode(): void {
    if (this.formMode === FormModeEnum.login) {
      this.formMode = FormModeEnum.signup;
      this.formName = 'Sign Up';
    } else {
      this.formMode = FormModeEnum.login;
      this.formName = 'Sign In';
    }
  }
}
