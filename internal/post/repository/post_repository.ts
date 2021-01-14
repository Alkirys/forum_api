import DB from '../../db/db';
import { Post } from '../models/post_models';

class PostRepository
{
    async insertInto(posts: Post[]): Promise<Post[]> {
        // let query = 'INSERT INTO posts (author, forum, message, parent, thread, created) VALUES ';
        // const date = new Date(Date.now()).toISOString();
        //
        // for (let post of posts) {
        //     const tmpPost: {id: number} = await DB.one(query + `($1, $2, $3, $4, $5, $6)` + ' RETURNING id',
        //         [post.authorId, post.forumId, post.message, post.parentId, post.threadId, date]);
        //     post.id = tmpPost.id;
        //     // post.parentId = tmpPost.parent;
        //     post.created = date;
        //     post.thread = post.threadId;
        //     // console.log(post.parentId)
        //     await DB.none(`INSERT INTO forums_users (user_id, forum_id) VALUES
        //         ($1, $2) ON CONFLICT DO NOTHING`,
        //         [post.authorId, post.forumId]);
        // }
        //
        // return posts;

        let query = 'INSERT INTO posts (author, forum, message, parent, thread, created) VALUES ';
        let args = [];
        let argNumber = 1;
        let queryUsers = 'INSERT INTO forums_users (user_id, forum_id) VALUES ';
        let argsUsers = [];
        let argUsersNumber = 1;
        const date = new Date(Date.now()).toISOString();

        for (let post of posts) {
            query += `(${'$' + argNumber}, ${'$' + (argNumber + 1)}, ${'$' + (argNumber + 2)}, ${'$' + (argNumber + 3)}, ${'$' + (argNumber + 4)}, ${'$' + (argNumber + 5)}),`;
            argNumber += 6;
            args.push(post.authorId, post.forumId, post.message, post.parentId, post.threadId, date);
            queryUsers += `(${'$' + argUsersNumber}, ${'$' + (argUsersNumber + 1)}),`;
            argUsersNumber += 3;
            // console.log('AUTHOR_ID:', post.authorId);
            // console.log('FORUM_ID:', post.forumId);
            argsUsers.push(post.authorId, post.forumId);
            // argsUsers.push(post.forumId);
        }

        try {
            query = query.slice(0, -1);
            const tmpPost: {id: number}[] = await DB.many(query + ' RETURNING id', args);
            console.log('AUTHOR_ID:', tmpPost);
            for (let i = 0; i < tmpPost.length; i++) {
                posts[i].id = tmpPost[i].id;
                // post.parentId = tmpPost.parent;
                posts[i].created = date;
                posts[i].thread = posts[i].threadId;
                // console.log(post.parentId)
            }
        } catch (e) {
            console.log(query + ' RETURNING id');
            console.log(args);
            console.log(e)
        }

        queryUsers = queryUsers.slice(0, -1);
        queryUsers +=  ' ON CONFLICT DO NOTHING';
        try {
            await DB.none(queryUsers, argsUsers);
        } catch (e) {
            console.log(queryUsers);
            console.log(argNumber);
            console.log(e)
        }

        return posts;
    }

    async getCountByForumId(id: number): Promise<number> {
        return await DB.one(`SELECT count(*) AS count from posts WHERE forum = $1`,
            [id])
            .then((count: number) => count)
            .catch(() => -1);
    }

    async getById(id: number): Promise<Post> {
        return await DB.one(`SELECT p.id, u.nickname AS author, f.slug AS forum, p.thread, p.message, p.created, p.isEdited, 
            coalesce(path[array_length(path, 1) - 1], 0) FROM posts AS p 
            JOIN users AS u ON (u.id = p.author) 
            JOIN forums AS f ON (f.id = p.forum) WHERE p.id = $1`,
            [id])
            .then((post: Post) => post)
            .catch((e) => { return null});
    }

    async updatePost(post: Post): Promise<Post> {
        return await DB.none(`UPDATE posts SET message = $2, isEdited = TRUE 
            WHERE id = $1`, [post.id, post.message])
            .then(() => {post.isEdited = true; return post})
            .catch((e) => { return null});
    }

    async getByThread(id: number, limit: number, since: number, sort: string, desc: boolean): Promise<Post[]> {
        if (sort === undefined) {
            sort = 'flat';
        }
        let query = `SELECT p.id, u.nickname AS author, f.slug AS forum, p.parent, p.thread, p.created, p.message, p.isEdited, 
            coalesce(p.path[array_length(p.path, 1) - 1], 0) FROM posts AS p 
            JOIN users AS u ON (u.id = p.author) 
            JOIN forums AS f ON (f.id = p.forum) 
            WHERE `;
        let where: string;
        let order: string;

        if (since === undefined) {
            since = 0;
        }

        switch (sort) {
            case 'flat':
            case '':
                where = 'p.thread = $1';
                if (since !== 0) {
                    if (desc) {
                        where += ' AND p.id < $2';
                    } else {
                        where += ' AND p.id > $2';
                    }
                }
                order = 'ORDER BY ';
                if (sort === 'flat') {
                    order += 'p.created';
                    if (desc) {
                        order += ' DESC';
                    }
                    order += ', p.id';
                    if (desc) {
                        order += ' DESC';
                    }
                } else {
                    order += 'p.id';
                    if (desc) {
                        order += ' DESC';
                    }
                }
                if (limit !== 0) {
                    if (since !== 0) {
                        order += ' LIMIT $3';
                    } else {
                        order += ' LIMIT $2';
                    }
                }
                break;
            case 'tree':
                where = 'p.thread = $1';
                if (since !== 0) {
                    if (desc) {
                        where += ' AND coalesce(path < (select path FROM posts where id = $2), true)';
                    } else {
                        where += ' AND coalesce(path > (select path FROM posts where id = $2), true)';
                    }
                }
                order = 'ORDER BY p.path[1]';
                if (desc) {
                    order += ' DESC';
                }
                order += ', p.path[2:]';
                if (desc) {
                    order += ' DESC';
                }
                order += ' NULLS FIRST';
                if (limit !== 0) {
                    if (since !== 0) {
                        order += ' LIMIT $3';
                    } else {
                        order += ' LIMIT $2';
                    }
                }
                break;
            case 'parent_tree':
                where = 'p.path[1] IN (SELECT path[1] FROM posts WHERE thread = $1 AND array_length(path, 1) = 1';
                if (since !== 0) {
                    if (desc) {
                        where += ' AND id < (SELECT path[1] FROM posts WHERE id = $2)';
                    } else {
                        where += ' AND id > (SELECT path[1] FROM posts WHERE id = $2)';
                    }
                }
                where += ' ORDER BY id';
                if (desc) {
                    where += ' DESC';
                }
                if (limit !== 0) {
                    if (since !== 0) {
                        where += ' LIMIT $3';
                    } else {
                        where += ' LIMIT $2';
                    }
                }
                where += ')';
                order = 'ORDER BY p.path[1]';
                if (desc) {
                    order += ' DESC';
                }
                order += ', p.path[2:] NULLS FIRST';
        }

        // console.log(query + where + ' ' + order);
        // console.log(id, since, limit)
        if (since !== 0) {
            if (limit !== 0) {
                return await DB.manyOrNone(query + where + ' ' + order, [id, since, limit])
                    .then(posts => { return posts})
                    .catch((e) => { return null});
            } else {
                return await DB.manyOrNone(query + where + ' ' + order, [id, since])
                    .then(posts => {return posts})
                    .catch((e) => { return null});
            }
        } else {
            if (limit !== 0) {
                return await DB.manyOrNone(query + where + ' ' + order, [id, limit])
                    .then(posts => { return posts})
                    .catch((e) => { return null});
            } else {
                return await DB.manyOrNone(query + where + ' ' + order, [id])
                    .then(posts => { return posts})
                    .catch((e) => { return null});
            }
        }
    }

    async checkParentPosts(posts: Post[], threadId: number): Promise<boolean> {
        let parents = {};
        let vals: number[] = [];
        vals.push(threadId);

        let query = 'SELECT count(*) AS count FROM posts WHERE thread = $1 AND id in (';

        let tmp = 2;
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].parentId > 0) {
                query += `$${tmp},`;
                if (parents[posts[i].parentId] === undefined) {
                    parents[posts[i].parentId] = 1;
                } else {
                    parents[posts[i].parentId] += 1;
                }
                vals.push(posts[i].parentId);
                tmp++;
            }
        }

        if (Object.keys(parents).length === 0) {
            return true;
        }

        query = query.slice(0, query.length - 1) + ')';
        return await DB.one(query, vals)
            .then((res: {count: number}) => {
                return res.count == Object.keys(parents).length;
            }).catch((e) => { return false});
    }
}

export default new PostRepository();
