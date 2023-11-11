import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private router: Router) {
    const route = localStorage.getItem('route');

    if (route) {
      localStorage.removeItem('route');
      this.router.navigate([route]);
    }
  }

}
