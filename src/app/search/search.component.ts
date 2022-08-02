import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country, CountriesService, Options, Subregion } from '../shared/services/countries.service';

interface Data {
  countries: Country[] | null;
  options: Options;
}

interface OptionsForm {
  showName: FormControl<boolean | null>;
  showRegion: FormControl<boolean | null>;
  showSubregion: FormControl<boolean | null>;
}

interface SearchForm {
  name?: FormControl<string | null>;
  region?: FormControl<string | null>;
  subregion?: FormControl<string | null>;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  data$: Observable<Data>;
  options$: Observable<Options>;
  optionsForm: FormGroup<OptionsForm>;
  regions$: Observable<string[] | null>;
  searchForm: FormGroup<SearchForm>;
  subregions$: Observable<Subregion[] | null>;

  constructor(private countriesSvc: CountriesService) { }

  ngOnInit(): void {
    this.optionsForm = new FormGroup<OptionsForm>({
      showName: new FormControl(this.countriesSvc.getCurrentOptions().showName),
      showRegion: new FormControl(this.countriesSvc.getCurrentOptions().showName),
      showSubregion: new FormControl(this.countriesSvc.getCurrentOptions().showName)
    });

    this.searchForm = new FormGroup<SearchForm>({
      name: new FormControl(''),
      region: new FormControl(''),
      subregion: new FormControl('')
    });

    this.data$ = combineLatest([
      this.countriesSvc.countries$,
      this.countriesSvc.options$
    ]).pipe(
      map(([countries, options]) => ({ countries, options }))
    );

    this.regions$ = this.countriesSvc.regions$;

    this.subregions$ = this.countriesSvc.subregions$;

    if (this.countriesSvc.getCurrentSearchCriteria()) {
      const currentSearchCriteria = this.countriesSvc.getCurrentSearchCriteria();

      this.searchForm.patchValue({
        name: currentSearchCriteria?.name || '',
        region: currentSearchCriteria?.region || '',
        subregion: currentSearchCriteria?.subregion || ''
      });
    }
  }

  changeOptions(): void {
    this.countriesSvc.changeOptions(this.optionsForm.value as Options);
  }

  changeRegion(): void {
    this.countriesSvc.changeRegion(this.searchForm.get('region')?.value as string);
  }

  search(): void {
    this.countriesSvc.search(this.searchForm.value);
  }
}
