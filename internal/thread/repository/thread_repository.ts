import DB from '../../db/db';
import { Thread } from '../models/thread_models';

class ThreadRepository
{
    getCountByForumId(id: number): number {
        return DB.one(`SELECT count(*) AS count FROM threads WHERE forum = $1`,
            [id])
            .then((count: number) => count)
            .catch(() => -1);
    }

    insertInto(thread: Thread): Thread {
        let date: string;
        if (thread.created === undefined) {
            date = new Date(Date.now()).toISOString();
        } else {
            date = thread.created;
        }
        return DB.one(`INSERT INTO threads (slug, author, title, message, forum, created) 
            VALUES (NULLIF ($1, ''), $2, $3, $4, $5, $6) RETURNING id`,
            [thread.slug, thread.authorId, thread.title, thread.message, thread.forumId, date])
            .then((res: {id: number}) => {
                thread.id = res.id;
                return thread;
            })
            .catch((e) =>  { return null});
    }

    getBySlug(slug: string): Thread {
        return DB.one(`SELECT t.id, u.nickname, t.created, t.forum, f.slug, t.message, 
            coalesce (t.slug, ''), t.title, t.votes FROM threads AS t 
            JOIN users AS u ON (t.author = u.id) 
            JOIN forums AS f ON (f.id = t.forum) WHERE lower(t.slug) = lower($1)`,
            [slug])
            .then((thread: Thread) => thread)
            .catch(() => null);
    }

    getById(id: number): Thread {
        return DB.one(`SELECT t.id, u.nickname, t.created, t.forum, f.slug, t.message, 
            coalesce (t.slug, ''), t.title, t.votes FROM threads AS t 
            JOIN users AS u ON (t.author = u.id) 
            JOIN forums AS f ON (f.id = t.forum) WHERE t.id = $1`,
            [id])
            .then((thread: Thread) => thread)
            .catch(() => null);
    }

    updateThread(thread: Thread): Thread {
        return DB.none(`UPDATE threads SET message = $2, title = $3 WHERE id = $1`,
            [thread.id, thread.message, thread.title])
            .then(() => thread)
            .catch((e) => {return null});
    }

    getByForumSlug(slug: string, limit: number, since: string, desc: boolean): Thread[] {
        let query = `SELECT t.id, u.nickname AS author, t.created, f.slug AS forum, t.message, 
            coalesce (t.slug, ''), t.title, t.votes, t.slug FROM threads AS t 
            JOIN users AS u ON (t.author = u.id) 
            JOIN forums AS f ON (f.id = t.forum) WHERE lower(f.slug) = lower($1)`;
        let orderStr = ' ORDER BY t.created';

        if (desc) {
            orderStr += ' DESC';
        }
        if (limit !== 0) {
            orderStr += ` LIMIT ${limit}`;
        }
        let args: string[] = [];
        args.push(slug);
        if (since !== undefined && since !== '') {
            if (desc) {
                query += ' AND t.created <= $2';
            } else {
                query += ' AND t.created >= $2';
            }
            args.push(since);
        }
        return DB.manyOrNone(query + orderStr, args)
            // .then((threads: Thread[]) => threads)
            .then((threads: Thread[]) => {
                // console.log(query + orderStr)
                // console.log(slug, limit, since, desc)
                // console.log('KEK ', threads);
                return threads;
            })
            // .catch(() => null);
            .catch((e) => {
                // console.log(e);
                return null;
            });
    }
}

export default new ThreadRepository();
