import { PermissionLevel } from './types';

export class PermissionGuard {
  private ownerIds: Set<string>;
  private adminIds: Set<string>;

  constructor(ownerIds: string[] = [], adminIds: string[] = []) {
    this.ownerIds = new Set(ownerIds);
    this.adminIds = new Set(adminIds);
  }

  public getUserLevel(userId: string): PermissionLevel {
    if (this.ownerIds.has(userId)) return 'OWNER';
    if (this.adminIds.has(userId)) return 'ADMIN';
    return 'USER';
  }

  public hasPermission(userId: string, requiredLevel: PermissionLevel): boolean {
    const userLevel = this.getUserLevel(userId);

    const levels: Record<PermissionLevel, number> = {
      'USER': 0,
      'ADMIN': 1,
      'OWNER': 2
    };

    return levels[userLevel] >= levels[requiredLevel];
  }

  public addAdmin(userId: string): void {
    this.adminIds.add(userId);
  }

  public removeAdmin(userId: string): void {
    this.adminIds.delete(userId);
  }

  public isOwner(userId: string): boolean {
    return this.ownerIds.has(userId);
  }
}
