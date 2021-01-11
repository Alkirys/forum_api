import DB from '../../db/db'

class ServiceRepository
{
    getCountForum(): number {
        return DB.one(`SELECT count(*) AS count from forums`)
            .then((res: {count: number}) => res.count)
            .catch(() => -1);
    }

    getCountPost(): number {
        return DB.one(`SELECT count(*) AS count from posts`)
            .then((res: {count: number}) => res.count)
            .catch(() => -1);
    }

    getCountThread(): number {
        return DB.one(`SELECT count(*) AS count from threads`)
            .then((res: {count: number}) => res.count)
            .catch(() => -1);
    }

    getCountUser(): number {
        return DB.one(`SELECT count(*) AS count from users`)
            .then((res: {count: number}) => res.count)
            .catch(() => -1);
    }

    deleteForums(): number {
        return DB.none(`TRUNCATE TABLE forums CASCADE`)
            .then(() => 1)
            .catch(() => 0);
    }

    deletePosts(): number {
        return DB.none(`TRUNCATE TABLE posts CASCADE`)
            .then(() => 1)
            .catch(() => 0);
    }

    deleteThreads(): number {
        return DB.none(`TRUNCATE TABLE threads CASCADE`)
            .then(() => 1)
            .catch(() => 0);
    }

    deleteUsers(): number {
        return DB.none(`TRUNCATE TABLE users CASCADE`)
            .then(() => 1)
            .catch(() => 0);
    }

    deleteVotes(): number {
        return DB.none(`TRUNCATE TABLE votes CASCADE`)
            .then(() => 1)
            .catch(() => 0);
    }
}

export default new ServiceRepository();
