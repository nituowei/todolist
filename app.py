# 导入 Flask 模块和 sqlite3 模块
from flask import Flask, request, jsonify, render_template # 导入 render_template
import sqlite3

# 初始化 Flask 应用
app = Flask(__name__)

# SQLite 数据库文件路径
DATABASE = 'todos.db'

# 初始化数据库连接
def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # 将查询结果返回为字典形式
    return conn

# 初始化数据库表 (如果不存在)
def init_db():
    conn = get_db_connection()
    with app.open_resource('schema.sql', mode='r') as f: # 读取 schema.sql 文件
        conn.executescript(f.read()) # 执行 SQL 脚本
    conn.commit()
    conn.close()


# 渲染前端页面
@app.route('/') # 定义根路由 /
def index():
    return render_template('index.html') # 渲染 templates/index.html 模板

# 在应用启动时初始化数据库
@app.cli.command('initdb') # 添加一个命令行命令 'initdb'
def initdb_command():
    """初始化数据库."""
    init_db()
    print('数据库已初始化.')

# 获取所有 to-do 事项
@app.route('/todos', methods=['GET']) # 定义 GET 请求路由 /todos
def get_todos():
    conn = get_db_connection()
    todos = conn.execute('SELECT * FROM todos').fetchall() # 查询所有 to-do 事项
    conn.close()
    todo_list = []
    for todo in todos:
        todo_list.append(dict(todo)) # 将每一项转换为字典并添加到列表中
    return jsonify(todo_list) # 返回 JSON 格式的 to-do 列表

# 创建新的 to-do 事项
@app.route('/todos', methods=['POST']) # 定义 POST 请求路由 /todos
def create_todo():
    task = request.json['task'] # 从请求的 JSON 数据中获取 'task' 字段
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO todos (task, completed) VALUES (?, ?)', (task, False)) # 插入新的 to-do 事项，默认未完成
    conn.commit()
    todo_id = cursor.lastrowid # 获取最后插入行的 ID
    conn.close()
    return jsonify({'id': todo_id, 'task': task, 'completed': False}), 201 # 返回新创建的 to-do 事项和状态码 201 (Created)

# 更新 to-do 事项 (例如标记为已完成)
@app.route('/todos/<int:id>', methods=['PUT']) # 定义 PUT 请求路由 /todos/{id}，id 为整数类型
def update_todo(id):
    completed = request.json['completed'] # 从请求的 JSON 数据中获取 'completed' 字段
    conn = get_db_connection()
    conn.execute('UPDATE todos SET completed = ? WHERE id = ?', (completed, id)) # 更新指定 ID 的 to-do 事项的 'completed' 状态
    conn.commit()
    conn.close()
    return jsonify({'message': 'Todo updated'}), 200 # 返回成功消息和状态码 200 (OK)

# 删除 to-do 事项
@app.route('/todos/<int:id>', methods=['DELETE']) # 定义 DELETE 请求路由 /todos/{id}，id 为整数类型
def delete_todo(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM todos WHERE id = ?', (id,)) # 删除指定 ID 的 to-do 事项
    conn.commit()
    conn.close()
    return jsonify({'message': 'Todo deleted'}), 200 # 返回成功消息和状态码 200 (OK)

# 运行 Flask 应用
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') # 运行在所有网络接口，方便从外部访问，debug=True 方便开发调试

