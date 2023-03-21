import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  constructor(private router: Router) {}
  onSignup() {
    alert(`Cannot signup yet`);
  }

  onSignin() {
    this.router.navigateByUrl('/login');
  }
}
