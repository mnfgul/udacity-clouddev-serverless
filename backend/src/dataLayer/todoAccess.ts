import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS);

import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

function createDynamoDBClient(): DocumentClient {
    return new XAWS.DynamoDB.DocumentClient();
}

export class TodoAccess {
	
	public constructor(
		private readonly docClient: DocumentClient = createDynamoDBClient(),
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly userIdIndex = process.env.USERID_INDEX,
	) {}
		
	/**
	 * Create new todo item function
	*/
	public async createTodo(todoItem: TodoItem): Promise<TodoItem> {
		//log operation
		const logger = createLogger('create-todo')
		logger.info('Creating a ToDo item ', { ...todoItem })

		//create new item
		await this.docClient
		.put({
			TableName: this.todosTable,
			Item: todoItem,
		})
		.promise()
		
		return todoItem;
	  }
	  
	/**
	 * Delete ToDo item function
	 */
	public async deleteTodo(todoId: string, userId: string): Promise<TodoItem[]> {
		//logging opreation
		const logger = createLogger('delete-todo')
		logger.info('Deleting ToDo item')
		
		//delete operation
		this.docClient
			.delete({
				TableName: this.todosTable,
				Key: {
					todoId: todoId, userId: userId
				},
			})
			.promise();
		return []
	}

		
	/**
	 * Get all ToDo items for current user
	 */
    public async getAllTodos(userId: string): Promise<TodoItem[]> {
		//logging operation
		const logger = createLogger('get-todos')
		logger.info('Getting all ToDo items for current user ')
		
		const result = await this.docClient
			.scan({
				TableName: this.todosTable,
				FilterExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
			})
			.promise();

		const items = result.Items;
		return items as TodoItem[];
    }

	/** 
	 * Get single ToDo item details
	*/
    public async getTodo(todoId: string, userId: string): Promise<TodoItem> {
		const logger = createLogger('get-todo-item')
		logger.info('Getting single ToDo item')

		const result = await this.docClient
		.query({
			TableName: this.todosTable,
			IndexName: this.userIdIndex,
			KeyConditionExpression: 'todoId = :todoId and userId = :userId',
			ExpressionAttributeValues: {
				':todoId': todoId,
				':userId': userId,
			},
		})
		.promise();

		const item = result.Items[0];
		return item as TodoItem;
    }


    public async updateTodo(
        todoId: string,
        createdAt: string,
        todoUpdate: TodoUpdate,
    ): Promise<void> {

		const logger = createLogger('update-todo')
		logger.info('Updating a ToDo item ', { ...todoUpdate })

		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: { todoId, createdAt },
				UpdateExpression: 'set #name = :n, done = :d, dueDate = :dt',
				ExpressionAttributeNames: {
					'#name': 'name'
				},
				ExpressionAttributeValues: {
					':n': todoUpdate.name,
					':d': todoUpdate.done,
					':dt': todoUpdate.dueDate
				},
				ReturnValues: 'UPDATED_NEW'
			})
			.promise()

    }

    public async setAttachmentUrl(
        todoId: string,
        createdAt: string,
        attachmentUrl: string,
    ): Promise<void> {
        this.docClient
            .update({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    createdAt,
                },
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': attachmentUrl,
                },
                ReturnValues: 'UPDATED_NEW',
            })
            .promise();
	}
	


}
