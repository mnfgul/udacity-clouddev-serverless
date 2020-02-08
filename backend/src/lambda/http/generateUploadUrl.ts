import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as uuid from 'uuid';
import { setAttachmentUrl } from '../../businessLogic/todos';

const XAWS = AWSXRay.captureAWS(AWS);
const S3 = new XAWS.S3({
	signatureVersion: 'v4'
});
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

function getUploadUrl(imageId: string): string {
	return S3.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: imageId,
		Expires: parseInt(urlExpiration),
	});
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const authorization = event.headers.Authorization;
	const split = authorization.split(' ');
	const jwtToken = split[1];

	const imageId = uuid.v4();

	
	await setAttachmentUrl(
		todoId,
		`https://${bucketName}.s3.amazonaws.com/${imageId}`,
		jwtToken,
	);
	

	const uploadUrl = getUploadUrl(imageId);
	return {
		statusCode: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Credentials': true
		},
		body: JSON.stringify({
			uploadUrl
		})
	}
}