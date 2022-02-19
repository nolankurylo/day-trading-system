DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_funds;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS buys;
DROP TABLE IF EXISTS sells;

create table users (
  id SERIAL, 
  userid varchar(100) NOT NULL, 
  user_password varchar(100) NOT NULL,
  user_email varchar(100) NOT NULL,
  role varchar(100) NOT NULL default 'trader',
  PRIMARY KEY(userid)
);

create table user_funds(
	funds_id SERIAL,
  	userid varchar(100) NOT NULL,
  	funds REAL NOT NULL DEFAULT 0.0 CHECK(funds >= 0.0), 
	PRIMARY KEY(funds_id),
  	CONSTRAINT fk_userid
      FOREIGN KEY(userid) 
         REFERENCES users(userid)
);

create table buys(
	buy_trigger_id SERIAL,
  	userid varchar(100),
    stockSymbol varchar(3) NOT NULL,
  	buy_trigger_threshold REAL NULL CHECK(buy_trigger_threshold > 0.0),
    is_active BOOLEAN NOT NULL,
    buy_amount real NOT NULL CHECK(buy_amount > 0.0),
	PRIMARY KEY(buy_trigger_id),
  	CONSTRAINT fk_userid
      FOREIGN KEY(userid) 
         REFERENCES users(userid)
);

create table sells(
	sell_trigger_id SERIAL,
  	userid varchar(100),
    stockSymbol varchar(3) NOT NULL,
  	sell_trigger_threshold REAL NULL CHECK(sell_trigger_threshold > 0.0),
    is_active BOOLEAN NOT NULL,
    sell_amount real NOT NULL CHECK(sell_amount > 0.0),
	PRIMARY KEY(sell_trigger_id),
  	CONSTRAINT fk_userid
      FOREIGN KEY(userid) 
         REFERENCES users(userid)
);

create table transactions(
  id SERIAL,
	transactionNum int NOT NULL,
  	username varchar(100) NULL,
    command varchar(100) NULL,
    funds REAL NULL CHECK(funds >= 0.0),
    timestamp BIGINT NOT NULL,
    server varchar(100) NOT NULL,
    stockSymbol varchar(3) NULL,
    LogType varchar(100) NOT NULL,
    price REAL NULL CHECK(price >= 0.0),
    filename varchar(100) NULL, 
    quoteServerTime BIGINT NULL,
    cryptoKey varchar(100) NULL,
    action varchar(100) NULL,
    errorMessage varchar(250) NULL,
    debugMessage varchar(250) NULL,
    buy_state varchar(20), NULL,
 	PRIMARY KEY(id)
);

INSERT INTO users (userid, user_password, user_email, role)
VALUES ('admin', 'nalt123', 'test@yahoo.ca', 'admin');