#!/bin/bash

# Build project source
echo "Building portal project TARGET=$TARGET, ENVIRONMENT=$ENVIRONMENT"

if [ "$ENVIRONMENT" == "local" ]; then

    echo "Starting project in development mode"
    ng serve --target=$TARGET --environment=$ENVIRONMENT --host 0.0.0.0 --port 80 --poll 500 --watch --live-reload true --disable-host-check --public esignature.network.local
    
else
    ng build --target=$TARGET --environment=$ENVIRONMENT --disable-host-check

    # Copy dist folder to nging folder
    echo "Copying dist source to www folder"
    cp -R /usr/src/app/dist/* /var/www/html

    echo "Running nginx with daemon off"
    nginx -g 'daemon off;'
fi



