document.addEventListener('DOMContentLoaded', function() { // 页面加载完成后执行
    const taskInput = document.getElementById('new-task'); // 获取任务输入框元素
    const addTaskButton = document.getElementById('add-task-btn'); // 获取添加任务按钮元素
    const todoList = document.getElementById('todo-list'); // 获取 to-do 列表元素

    // 获取所有 to-do 事项并渲染到页面
    function fetchTodos() {
        fetch('/todos') // 发送 GET 请求到 /todos API
            .then(response => response.json()) // 将响应解析为 JSON
            .then(todos => {
                todoList.innerHTML = ''; // 清空 to-do 列表
                todos.forEach(todo => { // 遍历每个 to-do 事项
                    const listItem = createTodoItemElement(todo); // 创建 to-do 事项的 HTML 元素
                    todoList.appendChild(listItem); // 将元素添加到 to-do 列表
                });
            });
    }

    // 创建单个 to-do 事项的 HTML 元素
    function createTodoItemElement(todo) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="${todo.completed ? 'completed' : ''}">${todo.task}</span>
            <div class="todo-actions">
                <button class="complete-btn" data-id="${todo.id}">${todo.completed ? '未完成' : '完成'}</button>
                <button class="delete-btn" data-id="${todo.id}">删除</button>
            </div>
        `;

        // 为完成/未完成按钮添加事件监听器
        const completeButton = listItem.querySelector('.complete-btn');
        completeButton.addEventListener('click', () => {
            const todoId = completeButton.dataset.id;
            const completed = !todo.completed;
            updateTodo(todoId, completed);
        });

        // 为删除按钮添加事件监听器
        const deleteButton = listItem.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            const todoId = deleteButton.dataset.id;
            deleteTodo(todoId);
        });

        return listItem;
    }

    // 添加新的 to-do 事项
    addTaskButton.addEventListener('click', () => {
        const task = taskInput.value.trim(); // 获取输入框中的任务内容并去除空格
        if (task) { // 如果任务内容不为空
            fetch('/todos', { // 发送 POST 请求到 /todos API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 设置请求头为 JSON 格式
                },
                body: JSON.stringify({ task: task }) // 将任务内容转换为 JSON 字符串作为请求体
            })
            .then(response => response.json()) // 将响应解析为 JSON
            .then(newTodo => {
                const listItem = createTodoItemElement(newTodo); // 创建新 to-do 事项的 HTML 元素
                todoList.appendChild(listItem); // 将元素添加到 to-do 列表
                taskInput.value = ''; // 清空输入框
            });
        }
    });

    // 更新 to-do 事项的完成状态
    function updateTodo(id, completed) {
        fetch(`/todos/${id}`, { // 发送 PUT 请求到 /todos/{id} API
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json' // 设置请求头为 JSON 格式
            },
            body: JSON.stringify({ completed: completed }) // 将完成状态转换为 JSON 字符串作为请求体
        })
        .then(response => {
            if (response.ok) { // 如果响应状态码为 200-299 表示成功
                fetchTodos(); // 重新获取并渲染 to-do 列表，更新页面显示
            }
        });
    }

    // 删除 to-do 事项
    function deleteTodo(id) {
        fetch(`/todos/${id}`, { // 发送 DELETE 请求到 /todos/{id} API
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) { // 如果响应状态码为 200-299 表示成功
                fetchTodos(); // 重新获取并渲染 to-do 列表，更新页面显示
            }
        });
    }

    fetchTodos(); // 页面加载时，首次获取 to-do 事项列表
});