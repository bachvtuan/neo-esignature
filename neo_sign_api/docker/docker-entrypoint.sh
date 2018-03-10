#!/bin/bash
# npm run prepare:db
# npm run migrations

if [ "$ENVIRONMENT" == "local" ]; then
    npm start
else
    npm run prod
fi