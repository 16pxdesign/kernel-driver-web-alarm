#!/usr/bin/sh
cp /docker-entrypoint-initdb.d/mongod.conf /etc/mongod.conf
mongo "$MONGO_INITDB_DATABASE" <<EOF

db.createUser({
    user: "$MONGO_USERNAME",
    pwd: "$MONGO_PASSWORD",
    roles: [{
        role: 'dbOwner',
        db: "$MONGO_INITDB_DATABASE"
    }]
});
use $MONGO_INITDB_DATABASE;
db.createCollection("test");
EOF