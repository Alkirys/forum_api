import * as promise from 'bluebird';
// import * as pgPromise from 'pg-promise';
const pgPromise = require('pg-promise');

const local = 'postgres://postgres:postgres@localhost:5432/postgres';

const docker = 'postgres://docker:docker@localhost:5432/docker';

const pgp = pgPromise({ promiseLib: promise });
const db = pgp(docker);
export default db;
