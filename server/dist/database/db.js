"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_1 = require("../config");
const schema_1 = require("./schema");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let db = null;
function getDatabase() {
    if (!db) {
        // Ensure database directory exists
        const dbDir = path_1.default.dirname(config_1.config.databasePath);
        if (!fs_1.default.existsSync(dbDir)) {
            fs_1.default.mkdirSync(dbDir, { recursive: true });
        }
        db = new better_sqlite3_1.default(config_1.config.databasePath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        // Initialize tables
        db.exec(schema_1.createTablesSQL);
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
            }
            catch (e) {
                // Column already exists, ignore error
                if (!e.message.includes('duplicate column') && !e.message.includes('already exists')) {
                    console.warn(`Migration warning for ${column}:`, e.message);
                }
            }
        }
    }
    return db;
}
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}
//# sourceMappingURL=db.js.map