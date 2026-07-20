import { Component, OnDestroy, OnInit } from '@angular/core';

interface PlannerRoute {
  name: string;
  cities: string[];
  distance: number;
  eta: number;
  traffic: 'Light' | 'Moderate' | 'Heavy';
  points: string;
}

@Component({
  selector: 'app-route-planner-page',
  templateUrl: './route-planner-page.component.html',
  styleUrl: './route-planner-page.component.css',
})
export class RoutePlannerPageComponent implements OnInit, OnDestroy {
  source = 'Delhi';
  destination = 'Jaipur';
  waypointInput = 'Gurugram';
  selectedRoute = 0;
  routes: PlannerRoute[] = [];
  favorites: PlannerRoute[] = [];
  private timer?: number;

  cityPoints: Record<string, { x: number; y: number }> = {
    Delhi: { x: 165, y: 95 },
    Gurugram: { x: 150, y: 125 },
    Jaipur: { x: 105, y: 190 },
    Mumbai: { x: 120, y: 360 },
    Goa: { x: 150, y: 450 },
    Bangalore: { x: 235, y: 485 },
    Mysore: { x: 210, y: 525 },
    Kolkata: { x: 470, y: 260 },
    Darjeeling: { x: 440, y: 160 },
    Chennai: { x: 310, y: 520 },
    Pondicherry: { x: 335, y: 550 },
  };

  ngOnInit(): void {
    this.favorites = JSON.parse(localStorage.getItem('tedbus-favorite-routes') || '[]') as PlannerRoute[];
    this.planRoute();
    this.timer = window.setInterval(() => this.refreshTraffic(), 12000);
  }

  ngOnDestroy(): void {
    if (this.timer) window.clearInterval(this.timer);
  }

  get cities(): string[] {
    return Object.keys(this.cityPoints);
  }

  get waypoints(): string[] {
    return this.waypointInput.split(',').map((item) => item.trim()).filter((item) => this.cityPoints[item]);
  }

  planRoute(): void {
    const direct = [this.source, ...this.waypoints, this.destination];
    const scenic = [this.source, ...this.suggestMidpoints(), this.destination];
    const express = [this.source, this.destination];
    this.routes = [
      this.buildRoute('Recommended', direct),
      this.buildRoute('Lower traffic', scenic),
      this.buildRoute('Express', express),
    ];
    this.selectedRoute = 0;
  }

  refreshTraffic(): void {
    this.routes = this.routes.map((route) => this.buildRoute(route.name, route.cities));
  }

  saveFavorite(route: PlannerRoute): void {
    if (this.favorites.some((favorite) => favorite.cities.join('|') === route.cities.join('|'))) return;
    this.favorites = [route, ...this.favorites].slice(0, 6);
    localStorage.setItem('tedbus-favorite-routes', JSON.stringify(this.favorites));
  }

  loadFavorite(route: PlannerRoute): void {
    this.source = route.cities[0];
    this.destination = route.cities[route.cities.length - 1];
    this.waypointInput = route.cities.slice(1, -1).join(', ');
    this.planRoute();
  }

  private buildRoute(name: string, cities: string[]): PlannerRoute {
    const distance = Math.max(1, Math.round(this.totalDistance(cities)));
    const trafficScore = this.trafficScore(cities);
    const traffic = trafficScore > 1.32 ? 'Heavy' : trafficScore > 1.14 ? 'Moderate' : 'Light';
    const eta = Math.round((distance / 62) * trafficScore * 60);
    const points = cities.map((city) => `${this.cityPoints[city].x},${this.cityPoints[city].y}`).join(' ');
    return { name, cities, distance, eta, traffic, points };
  }

  private totalDistance(cities: string[]): number {
    return cities.slice(1).reduce((total, city, index) => {
      const previous = this.cityPoints[cities[index]];
      const current = this.cityPoints[city];
      return total + Math.hypot(current.x - previous.x, current.y - previous.y) * 4.8;
    }, 0);
  }

  private trafficScore(cities: string[]): number {
    const seed = cities.join('').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return 1 + ((seed + new Date().getMinutes()) % 40) / 100;
  }

  private suggestMidpoints(): string[] {
    const midpoint = this.cities.find((city) => city !== this.source && city !== this.destination && !this.waypoints.includes(city));
    return midpoint ? [midpoint] : [];
  }
}
