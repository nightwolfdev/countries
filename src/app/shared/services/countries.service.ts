import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Country {
  area: number;
  capital: string[];
  cca2: string;
  coatOfArms: Image;
  continents: string[];
  currencies: Currency;
  flags: Image;
  languages: Language;
  latlng: number[];
  name: {
    common: string;
    nativeName: {
      [code: string]: {
        common: string;
        official: string;
      };
    };
    official: string;
  };
  population: number;
  region: string;
  subregion: string;
  timezones: string[];
  tld: string[];
}

export interface Currency {
  [code: string]: {
    name: string;
    symbol: string;
  };
}

export interface Image {
  png: string;
  svg: string;
}

export interface Language {
  [code: string]: string;
}

export interface Options {
  showName: boolean | null;
  showRegion: boolean | null;
  showSubregion: boolean | null;
}

export interface Subregion {
  name: string;
  region: string;
}

interface SearchCriteria {
  name?: string | null;
  region?: string | null;
  subregion?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private _changeRegion = new BehaviorSubject<string | null>(null);
  private _changeOptions = new BehaviorSubject<Options>({ showName: false, showRegion: false, showSubregion: false });
  private _countries = new BehaviorSubject<Country[] | null>(null);
  private _regions = new BehaviorSubject<string[] | null>(null);
  private _searchCriteria = new BehaviorSubject<SearchCriteria | null>(null);
  private _subregions = new BehaviorSubject<Subregion[] | null>(null);

  readonly countries$: Observable<Country[] | null> = this.getCountriesByFilter();
  readonly options$: Observable<Options> = this._changeOptions.asObservable();
  readonly regions$: Observable<string[] | null> = this._regions.asObservable();
  readonly subregions$: Observable<Subregion[] | null> = this.getSubregions();

  constructor(private http: HttpClient) {
    this.getCountries().subscribe();
   }

  private getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>('https://restcountries.com/v3.1/all?fields=area,capital,cca2,coatOfArms,continents,currencies,flags,languages,latlng,name,population,region,subregion,timezones,tld').pipe(
      tap(countries => {
        const regions: string[] = [];
        const subregions: Subregion[] = [];

        countries.forEach(country => {
          if (country.region && !regions.includes(country.region)) {
            regions.push(country.region);
          }

          if (country.subregion && !subregions.some(entry => country.subregion === entry.name)) {
            subregions.push({
              name: country.subregion,
              region: country.region
            });
          }
        });

        this._countries.next(this.shuffleCountries(countries));
        this._regions.next(regions.sort());
        this._subregions.next(subregions.sort(this.sortSubregions));
      })
    )
  }

  private getCountriesByFilter(): Observable<Country[] | null> {
    return combineLatest([
      this._countries.asObservable(),
      this._searchCriteria.asObservable()
    ]).pipe(
      map(([countries, searchCriteria]) => {
         if (countries && searchCriteria) {
          return countries
            .filter(country => searchCriteria.name ? country.name.common.toLowerCase().includes(searchCriteria.name.toLowerCase()) : country)
            .filter(country => searchCriteria.region ? searchCriteria.region === country.region : country)
            .filter(country => searchCriteria.subregion ? searchCriteria.subregion === country.subregion : country);
        }

        return countries;
      })
    );
  }

  private getSubregions(): Observable<Subregion[] | null> {
    return combineLatest([
      this._subregions.asObservable(),
      this._changeRegion.asObservable()
    ]).pipe(
      map(([subregions, selectedRegion]) => {
        if (subregions && selectedRegion) {
          return subregions.filter(subregion => subregion.region === selectedRegion);
        }

        return subregions;
      })
    );
  }

  private shuffleCountries(countries: Country[]): Country[] {
    for (let i = countries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [countries[i], countries[j]] = [countries[j], countries[i]];
    }

    return countries;
  }

  private sortSubregions(a: Subregion, b: Subregion): number {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  }

  changeOptions(options: Options): void {
    this._changeOptions.next(options);
  }

  changeRegion(region: string): void {
    this._changeRegion.next(region);
  }

  getCountry(code: string): Observable<Country | undefined> {
    return this.countries$.pipe(
      map(countries => countries ? countries.find(c => c.cca2 === code) : undefined)
    )
  }

  getCurrentOptions(): Options {
    return this._changeOptions.getValue();
  }

  getCurrentSearchCriteria(): SearchCriteria | null {
    return this._searchCriteria.getValue();
  }

  search(searchCriteria: SearchCriteria): void {
    this._searchCriteria.next(searchCriteria);
  }
}
