# rental

docker-compose up --build 

docker-compose down -v

# access sql db

docker-compose exec db mysql -u root -p

rootpassword

use DB -> show tables -> select * from (table name);

todo: input validation for making an account