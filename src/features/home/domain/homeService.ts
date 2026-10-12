import { HomeRepository } from '../data/repositories/HomeRepository';
import { toDashboard, type DashboardSnapshot } from './homeTypes';

export class HomeService {
  constructor(private readonly repo = new HomeRepository()) {}

  async load(): Promise<DashboardSnapshot> {
    return toDashboard(await this.repo.getDashboard());
  }
}
