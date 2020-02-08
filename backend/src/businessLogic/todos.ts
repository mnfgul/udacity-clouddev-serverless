import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoAccess } from '../dataLayer/todoAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { parseUserId } from '../auth/utils';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todoAccess = new TodoAccess();

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken);
    return todoAccess.getAllTodos(userId);
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string,
): Promise<TodoItem> {
    const itemId = uuid.v4();
    const userId = parseUserId(jwtToken);

    return await todoAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    });
}

export async function deleteTodo(
	todoId: string,
	jwtToken: string,
): Promise<void> {
	const userId = parseUserId(jwtToken);
	const todo = await todoAccess.getTodo(todoId, userId);
	todoAccess.deleteTodo(todoId, todo.createdAt);
}

export async function updateTodo(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccess.getTodo(todoId, userId)
    todoAccess.updateTodo(todo.todoId, todo.createdAt, updateTodoRequest);
}

export async function setAttachmentUrl(
    todoId: string,
    attachmentUrl: string,
    jwtToken: string,
): Promise<void> {
    const userId = parseUserId(jwtToken);
    const todo = await todoAccess.getTodo(todoId, userId);
    todoAccess.setAttachmentUrl(todoId, todo.createdAt, attachmentUrl);
}
