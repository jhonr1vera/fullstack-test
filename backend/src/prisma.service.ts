import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from './prisma/db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = db;

  async onModuleInit() {
    // In Prisma Next, connection is lazy, but we can verify it if needed
  }

  async onModuleDestroy() {
    // Clean up connections if necessary
  }
}
