import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../businessLogic/todos';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const authorization = event.headers.Authorization;
	const split = authorization.split(' ');
	const jwtToken = split[1];

	await deleteTodo(todoId, jwtToken);

	return {
		statusCode: 202,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true
		},
		body: ''	
	}
}
