# Angular example

This example uses [Angular](https://angular.io/) with [Apollo Angular](https://apollo-angular.com/) library. Apollo Angular is designed from the ground up to make it easy to build UI components that fetch data with GraphQL.

## Install dependencies with Angular Schematics

With the help of Angular Schematics , you can install and configure apollo angular library directly using only the below command. 

```shell
$ ng add apollo-angular
```

The command will ask you to set up the URL of the GraphQL Server, copy and paste this url https://countries.trevorblades.com in the command line and hit enter.



## GraphQL Module

The previous command will generate `graphql.module.ts` file for you which contains the configuration of the apollo client.
The `app.module.ts` is also updated with all the necessary imports.

```ts
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';

import { HttpLink } from 'apollo-angular/http';
import { NgModule } from '@angular/core';
import { environment } from 'src/environments/environment';

const uri = `https://countries.trevorblades.com`; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
  return {
    link: httpLink.create({ uri }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}

```
## Countries Service

 Let's create a `CountriesService` that all application classes can use to get the countries.
We will use the dependency injection that Angular supports to inject it into the `CountriesComponent` constructor later.


```ts

import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

import { Country } from './countries/Country';
import { Injectable } from '@angular/core';


// write a GraphQL query that asks for information (name , capital, etc..) about all countries
const COUNTRIES = gql`
  {
    countries {
      name
      capital
      currency
      emoji
      phone
      continent {
        name
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  constructor(private apollo: Apollo) {}

  getCountries(): Observable<Country[]> {
    return this.apollo
      .watchQuery<any>({
        query: COUNTRIES,
      })
      .valueChanges.pipe(map((result) => result.data.countries));
  }
}


```



## Countries Component

```ts
import { Component } from '@angular/core';
import { CountriesService } from '../countries.service';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss'],
})
export class CountriesComponent {
  displayedColumns: string[] = [
    'name',
    'capital',
    'currency',
    'emoji',
    'phone',
    'continent',
  ];
  dataSource$ = this.countriesService.getCountries();

  constructor(private countriesService: CountriesService) {}
}

```

For the view, we are using [Angular material](https://material.angular.io/)'s datatable to display the list of countries. 

```html
<div class="mat-elevation-z8">
  <table mat-table [dataSource]="dataSource$" matSort>
    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
      <td mat-cell *matCellDef="let row">{{ row.name }}</td>
    </ng-container>

    <!-- Capital Column -->
    <ng-container matColumnDef="capital">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Capital</th>
      <td mat-cell *matCellDef="let row">{{ row.capital }}</td>
    </ng-container>

    <!-- Currency Column -->
    <ng-container matColumnDef="currency">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Currency</th>
      <td mat-cell *matCellDef="let row">{{ row.currency }}</td>
    </ng-container>

    <!-- Emoji Column -->
    <ng-container matColumnDef="emoji">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Emoji</th>
      <td mat-cell *matCellDef="let row">{{ row.emoji }}</td>
    </ng-container>

    <!-- Phone Column -->
    <ng-container matColumnDef="phone">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Phone</th>
      <td mat-cell *matCellDef="let row">+{{ row.phone }}</td>
    </ng-container>

    <!-- Continent Column -->
    <ng-container matColumnDef="continent">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Continent</th>
      <td mat-cell *matCellDef="let row">{{ row.continent.name }}</td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
  </table>
  <mat-paginator
    [pageSizeOptions]="[5, 10, 20]"
    showFirstLastButtons
    aria-label="Select page of periodic elements"
  >
  </mat-paginator>
</div>
```
