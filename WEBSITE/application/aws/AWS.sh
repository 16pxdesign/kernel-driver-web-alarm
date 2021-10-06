export AWS_ACCESS_KEY_ID=ASIA6E52LQVQSUQAL3OH
export AWS_SECRET_ACCESS_KEY=6QPdnxmxpz9O1T29oG0wYh5wQO7nbaMtJmktKNMy
export AWS_SESSION_TOKEN=FwoGZXIvYXdzEI///////////wEaDNcyP6FZ3agsjrF7OCLBAc1nTsjiDufNT9rrKbrARh/jpnjxxASWVbKuWxvFsa6iw/bf+tiw45Hbedw9lEF5FOEH0j4Xelwo2Hicg2BPPdREHNNrPS1alPcol250+XFtZycKOSBVKNgJRLBXeYQN8gj5TMWWAyVByWLUJZlloVEg9dsgEjX5omRJZ/VdvXNuAmxXij1818InN1jwRhGxkrTMk55/e4tN5r/SgpEdMqH2RJV6hH0vjJkifYBwswFt9DTqNq8/wQ4YPXPt3uQqWPwo6aXc/wUyLU0bBiO3QQdMuvvmTZPZjGg7t2UqwbTRHUe39AUYCkIshAqyDancwS7NcDjMIQ==


ecs-cli configure --cluster mcluster --default-launch-type EC2 --config-name mconfig --region us-east-1

ecs-cli configure profile --profile-name mcluster --access-key $AWS_ACCESS_KEY_ID --secret-key $AWS_SECRET_ACCESS_KEY --session-token $AWS_SESSION_TOKEN

ecs-cli up --capability-iam --force --keypair newkeypair --cluster-config mconfig --instance-type t2.small -size 2 --security-group sg-09897612ff6341eab --vpc vpc-0a26be658e7ee6ffd --subnets subnet-05834d13cba27bfa2, subnet-0f85c858b6d8b75b6

ecs-cli compose --project-name clusterproject service up --create-log-groups --cluster-config mconfig


ecs-cli compose --project-name clusterproject service ps  --cluster-config mconfig
ecs-cli compose --project-name clusterproject service down  --cluster-config mconfig


--aws-profile


ecs-cli configure profile --aws-profile mcluster



