Custom Google chat notifications for Runscope
=====================

This utility is an node.js AWS Lambda function to be used in conjunction with Runscope for custom Google chat notifications. It will send a custom notification via the Google chat 'Incoming Webhook' functionality

## How to use
### In Google Chat
- Set up an Incoming Webhook for the channel you want to notify as described [in this document](https://developers.google.com/hangouts/chat/how-tos/webhooks)
- Make a note of the webhook url for use in the next step

### Configure the Advanced Webhook in Runscope

- From the top right Runscope icon choose **Connected Services**
- Under **webhooks** choose **Connect*
- Set your threshold as desired
- For the **URL** use the **API endpoint** of the runscope-lambda-gchat lambda
- Be sure to add the following headers:
```bash
Content-Type: application/json
x-api-key: [API key of the runscope-lambda-gchat lambda]
gchaturl: [Google Chat Webhook URL from above]
```

## How to develop

- Make sure you have Node 12.14.1 installed 
- Run `yarn install` or `npm install` in the root of the project
- All code is in `index.js`
- To run tests use `yarn test` or `npm test`

## How to deploy

The runscope-lambda-gchat lambda has been manually created in the membership account.
The `deploy.sh` script in the root of the project will zip the necessary files into `Archive.zip` and then deploy that to AWS.
The script will not update the `node_modules` directory in `Archive.zip` to reduce the amount of time it takes, so if you change the dependencies of the project, you will need to uncomment line 3 in `deploy.sh` to bundle the new dependencies.