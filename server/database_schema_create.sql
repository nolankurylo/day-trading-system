DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_funds;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS buys;
DROP TABLE IF EXISTS sells;

create table users (
  user_id SERIAL, 
  user_name varchar(100), 
  user_password varchar(100),
  user_email varchar(100),
  PRIMARY KEY(user_id)
);

create table user_funds(
	funds_id SERIAL,
  	user_id SERIAL,
  	funds_amount REAL NOT NULL DEFAULT 0.0 CHECK(funds_amount >= 0.0), 
	PRIMARY KEY(funds_id),
  	CONSTRAINT fk_users_id
      FOREIGN KEY(user_id) 
         REFERENCES customers(user_id)
);

create table buys(
	buy_trigger_id SERIAL,
  	user_id SERIAL,
    stockSymbol varchar(3) NOT NULL,
  	buy_trigger_threshold REAL NOT NULL CHECK(funds_amount > 0.0),
    is_active BOOLEAN NOT NULL,
    buy_amount real NOT NULL CHECK(buy_amount > 0.0),
	PRIMARY KEY(buy_trigger_id),
  	CONSTRAINT fk_users_id
      FOREIGN KEY(user_id) 
         REFERENCES customers(user_id)
);

create table sells(
	sell_trigger_id SERIAL,
  	user_id SERIAL,
    stockSymbol varchar(3) NOT NULL,
  	sell_trigger_threshold REAL NOT NULL CHECK(funds_amount > 0.0),
    is_active BOOLEAN NOT NULL,
    sell_amount real NOT NULL CHECK(sell_amount > 0.0),
	PRIMARY KEY(sell_trigger_id),
  	CONSTRAINT fk_users_id
      FOREIGN KEY(user_id) 
         REFERENCES customers(user_id)
);

create table transactions(
	transactionNum SERIAL,
  	user_id SERIAL,
    command varchar(100) NOT NULL,
    funds REAL NULL CHECK(funds > 0.0),
    transaction_timestamp timestamp NOT NULL,
    server_name varchar(100) NOT NULL,
    stockSymbol varchar(3) NULL,
    LogType varchar(100) NOT NULL,
    price REAL NULL CHECK(price > 0.0),
    file_name varchar(100) NULL UNIQUE, -- does this need to be UNIQUE or NOT NULL
    quoteServerTime timestamp NULL,
    cryptokey varchar(100) NULL,
    action varchar(100) NULL,
    errorMessage varchar(250) NULL,
    debugMessage varchar(250) NULL,
 	PRIMARY KEY(transactionNum),
  	CONSTRAINT fk_users_id
      FOREIGN KEY(user_id) 
         REFERENCES customers(user_id)
);