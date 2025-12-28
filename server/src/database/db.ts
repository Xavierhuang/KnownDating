import Database from 'better-sqlite3';
import { config } from '../config';
import { createTablesSQL } from './schema';
import fs from 'fs';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure database directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(config.databasePath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    db.exec(createTablesSQL);
    
    // Migrations for existing databases - add new columns if they don't exist
    const newColumns = [
      'founder_status', 'industry', 'funding_status', 'company_name', 'company_stage',
      'role', 'founding_story', 'biggest_challenge', 'work_life_balance', 'ideal_date_night',
      'view_on_exit', 'date_people_who_talk_work', 'how_destress', 'coffee_order', 'hustle_quote',
      'terms_accepted', 'terms_accepted_at'
    ];
    
    for (const column of newColumns) {
      try {
        const columnType = column === 'terms_accepted' ? 'BOOLEAN DEFAULT 0' : 
                          column === 'terms_accepted_at' ? 'DATETIME' : 'TEXT';
        db.prepare(`ALTER TABLE users ADD COLUMN ${column} ${columnType}`).run();
      } catch (e: any) {
        // Column already exists, ignore error
        if (!e.message.includes('duplicate column') && !e.message.includes('already exists')) {
          console.warn(`Migration warning for ${column}:`, e.message);
        }
      }
    }
  }
  
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

