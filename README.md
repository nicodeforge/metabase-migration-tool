# Hello there !
This project aims at providing support for Metabase power users to let them easily manage models across different Metabase instance.

This project is not supported by [Metabase](https://github.com/metabase) in any way.

**Use at your own risk.**

## What you can achieve with this tool
- Duplicate a dashboard across 2 Metabase instances
- Duplicate a card across 2 Metabase instances



# Setup
## Environment variables

Please make sure to define the following environment variables : 
```
APP_DB_HOST
APP_DB_PORT
APP_DB_USER
APP_DB_PASSWORD
APP_DB_NAME
```

## Application database
You will find a docker-compose file to create a postgres database. It will create the basic database to manage :
- Users 
- Metabase Instances

**At no point will your Metabase Password be saved in database.** It is only used to authenticate through Metabase API.

# Start the project
Once your database is started and your environment variables set, you can proceed to start the project :

1. Build the backend : `cd backend && yarn run build`
2. Start the backend : `yarn run start:dev`
3. Start the frontend : `yarn run start`