import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-custom py-4 mt-5">
      <div class="container">
        <p class="m-0 text-center text-white footer-text">
          Copyright &copy; Ethereum Curieux {{ currentYear }}
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer-text {
      font-weight: 500;
      opacity: 0.9;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}