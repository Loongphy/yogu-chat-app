use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "Create initial tables",
        kind: MigrationKind::Up,
        sql: "
                CREATE TABLE IF NOT EXISTS chats (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    model_identifier TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS providers (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    protocol TEXT NOT NULL,
                    api_key TEXT,
                    base_url TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS models (
                    id TEXT PRIMARY KEY,
                    identifier TEXT NOT NULL,
                    name TEXT NOT NULL,
                    status INTEGER DEFAULT 1,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS model_provider (
                    id TEXT PRIMARY KEY,
                    model_id TEXT NOT NULL,
                    provider_id TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS prompts (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                );

                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    chat_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    files TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
                );

                CREATE TABLE IF NOT EXISTS web_search_results (
                    id TEXT PRIMARY KEY,
                    message_id TEXT NOT NULL,
                    title TEXT,
                    url TEXT NOT NULL,
                    published_date TEXT,
                    author TEXT,
                    score REAL,
                    image TEXT,
                    favicon TEXT,
                    text TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
                );

                -- 创建索引以优化查询性能
                CREATE INDEX idx_chats_created_at ON chats(created_at);
                CREATE INDEX idx_messages_chat_id ON messages(chat_id);
                CREATE INDEX idx_messages_created_at ON messages(created_at);
                CREATE INDEX idx_prompts_title ON prompts(title);
                CREATE INDEX idx_providers_name ON providers(name);
                CREATE INDEX idx_web_search_result_message_id ON web_search_results(message_id);
            ",
    }]
}
