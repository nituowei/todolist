DROP TABLE IF EXISTS todos; -- 如果表已存在，则删除

CREATE TABLE todos ( -- 创建名为 todos 的表
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- id 列，整数类型，主键，自动递增
    task TEXT NOT NULL, -- task 列，文本类型，非空
    completed BOOLEAN NOT NULL CHECK (completed IN (0, 1)) -- completed 列，布尔类型，非空，使用 CHECK 约束确保值为 0 或 1 (SQLite 没有真正的 BOOLEAN 类型)
);
