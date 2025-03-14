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
    footer {
      padding-top: 30px;    /* Espacement au-dessus du footer */
      padding-bottom: 30px; /* Espacement en-dessous du footer */
      margin-top: 50px;     /* Marge supplémentaire entre le contenu et le footer */
      text-align: center;   /* Centre tout le contenu du footer */
      background-color: rgba(15, 11, 51, 0.8); /* Couleur légèrement plus foncée que le fond */
    }
    
    .footer-text {
      font-weight: 500;
      opacity: 0.9;
      text-align: center;
      padding: 10px 0;
      margin: 0;
    }
    
    .container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}