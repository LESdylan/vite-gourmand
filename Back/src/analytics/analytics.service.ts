/**
 * Analytics Service (MongoDB)
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db, Collection } from 'mongodb';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  timestamp: Date;
  data: Record<string, any>;
}

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);
  private client: MongoClient | null = null;
  private db: Db | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  private async connect(): Promise<void> {
    const uri = this.config.get<string>('MONGODB_URI');
    if (!uri) {
      this.logger.warn('MongoDB URI not configured, analytics disabled');
      return;
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('analytics');
      this.logger.log('Connected to MongoDB Analytics');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
    }
  }

  private getCollection(name: string): Collection | null {
    return this.db?.collection(name) || null;
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const collection = this.getCollection('events');
    if (!collection) return;

    try {
      await collection.insertOne({ ...event, timestamp: new Date() });
    } catch (error) {
      this.logger.error('Failed to track event', error);
    }
  }

  async getEventsByType(
    eventType: string,
    limit = 100,
  ): Promise<AnalyticsEvent[]> {
    const collection = this.getCollection('events');
    if (!collection) return [];

    const docs = await collection
      .find({ eventType })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return docs as unknown as AnalyticsEvent[];
  }

  async getEventStats(days = 7): Promise<Record<string, number>> {
    const collection = this.getCollection('events');
    if (!collection) return {};

    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await collection
      .aggregate([
        { $match: { timestamp: { $gte: since } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ])
      .toArray();

    return result.reduce(
      (acc, r) => {
        acc[r._id as string] = r.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async disconnect(): Promise<void> {
    await this.client?.close();
  }
}
