import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Github {
  private apiUrl = 'https://api.github.com';

  constructor(private http: HttpClient) {}

  getUserRepos(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/${username}/repos?per_page=10&sort=updated`);
  }
}
