rm Archive.zip
zip Archive.zip ./index.js
zip Archive.zip ./package.json
zip -r Archive.zip node_modules/
aws lambda update-function-code \
    --function-name runscope-lambda-gchat \
    --zip-file fileb://Archive.zip \
    --profile membership \
    --region eu-west-1