import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { CryptoDetailComponent } from './crypto-detail.component';
import { CryptoService } from '../../services/crypto.service';

describe('CryptoDetailComponent', () => {
  let component: CryptoDetailComponent;
  let fixture: ComponentFixture<CryptoDetailComponent>;
  let mockCryptoService: jasmine.SpyObj<CryptoService>;

  beforeEach(async () => {
    mockCryptoService = jasmine.createSpyObj('CryptoService', ['getCryptoById', 'getCryptoHistory']);
    
    // Configuration des espions avec des valeurs de retour par défaut
    mockCryptoService.getCryptoById.and.returnValue(of({
      id: 'bitcoin',
      rank: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      supply: '19000000',
      maxSupply: '21000000',
      marketCapUsd: '800000000000',
      volumeUsd24Hr: '20000000000',
      priceUsd: '40000',
      changePercent24Hr: '2.5',
      vwap24Hr: '39500'
    }));
    
    mockCryptoService.getCryptoHistory.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [
        CryptoDetailComponent,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CryptoService, useValue: mockCryptoService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => 'bitcoin'
            })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should load crypto details on initialization', () => {
    expect(mockCryptoService.getCryptoById).toHaveBeenCalledWith('bitcoin');
  });
  
  it('should format price correctly', () => {
    // Test small values
    expect(component.formatPrice('0.00123')).toBe('$0.001230');
    // Test medium values
    expect(component.formatPrice('0.5')).toBe('$0.5000');
    // Test large values
    expect(component.formatPrice('40000')).toBe('$40000.00');
  });
  
  it('should format market cap correctly', () => {
    // Test million values
    expect(component.formatMarketCap('5000000')).toBe('$5.00 M');
    // Test billion values
    expect(component.formatMarketCap('5000000000')).toBe('$5.00 Mrd');
    // Test small values
    expect(component.formatMarketCap('500000')).toBe('$500000.00');
  });
  
  it('should get correct price change class', () => {
    expect(component.getPriceChangeClass('2.5')).toBe('stat-up');
    expect(component.getPriceChangeClass('-2.5')).toBe('stat-down');
  });
});