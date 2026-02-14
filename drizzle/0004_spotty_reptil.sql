CREATE TABLE IF NOT EXISTS "zip_coordinates" (
	"zip_code" varchar(10) PRIMARY KEY NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL
);
