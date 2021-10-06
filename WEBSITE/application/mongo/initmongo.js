//this file is for docker to create user for website
db.auth("${MONGO_INITDB_ROOT_USERNAME}","${MONGO_INITDB_ROOT_PASSWORD}")
db = db.getSiblingDB('web');
db.createUser({
   user: "${MONGO_USERNAME}",
    pwd: "{MONGO_PASSWORD}",
    roles: [{
       role: 'dbOwner',
        db: "${MONGO_INITDB_DATABASE}"
    }]
});
db.createCollection("test");


