import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { Observable } from 'rxjs';

import { Country, CountriesService } from '../shared/services/countries.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit {
  country$: Observable<Country | undefined>;

  constructor(
    private countriesSvc: CountriesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const code = decodeURIComponent(params.get('code') as string);

      this.country$ = this.countriesSvc.getCountry(code);
    });
  }

}
