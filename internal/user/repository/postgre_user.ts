import DB from '../../db/db';
import { User } from '../models/user_models';
import { Post } from '../../post/models/post_models';

class UserRepository
{
    insertInto(user: User): boolean {
        return DB.none(`INSERT INTO users (nickname, email, fullname, about) 
            VALUES ($1, $2, $3, $4)`, [user.nickname, user.email, user.fullname, user.about])
            .then(() => true)
            .catch(() => false);
    }

    getByNickname(nickname: string): User {
        return DB.one(`SELECT id, nickname, email, fullname, about FROM users 
            WHERE lower(nickname) = lower($1)`, [nickname])
            .then((user: User) => user)
            .catch(() => null);
    }

    getByEmail(email: string): User {
        return DB.one(`SELECT id, nickname, email, fullname, about FROM users 
            WHERE lower(email) = lower($1)`, [email])
            .then((user: User) => user)
            .catch(() => null);
    }

    updateUser(user: User): boolean {
        return DB.none(`UPDATE users SET email = $2, fullname = $3, about = $4  
            WHERE lower(nickname) = lower($1)`, [user.nickname, user.email, user.fullname, user.about])
            .then(() => true)
            .catch(() => false);
    }

    getUsersByForum(id: number, limit: number, since: string, desc: boolean): User[] {
        let query = `SELECT u.nickname, u.email, u.fullname, u.about FROM forums_users fu 
            JOIN users u ON (fu.user_id = u.id) WHERE fu.forum_id = $1`;
        let orderStr = ' ORDER BY lower(u.nickname)';

        if (desc) {
            orderStr += ' DESC';
        }
        if (limit !== undefined && limit !== 0) {
            orderStr += ` LIMIT ${limit}`;
        }
        let args: (number | string)[] = [];

        args.push(id);
        // console.log(since)
        if (since !== undefined && since !== '') {
            if (desc) {
                query += ' AND lower(u.nickname) < lower($2)';
            } else {
                query += ' AND lower(u.nickname) > lower($2)';
            }
            args.push(since);
        }
        // console.log('QUERY:', query + orderStr, '\nARGS:', args)

        return DB.manyOrNone(query + orderStr, args)
            .then((users: User[]) => users)
            .catch(() => null);
    }

    checkNicknames(posts: Post[]): Post[] { // привести к нормальному виду
        return DB.many('SELECT id, lower(nickname) AS nickname FROM users')
            .then((users: User[]) => {
                let names = {};
                for (const user of users) {
                    names[user.nickname] = user.id;
                }
                for (const post of posts) {
                    const id = names[post.author.toLowerCase()];
                    if (id === 0) {
                        return posts;
                    }
                    post.authorId = id;
                }

                for (const post of posts) {
                    if (post.authorId === undefined) {
                        return null;
                    }
                }
                // console.log('USERS: ',users)
                // console.log('POSTS!!!!!: ',posts)
                return posts;
            })
            .catch(() => null);
    }
}

export default new UserRepository();
