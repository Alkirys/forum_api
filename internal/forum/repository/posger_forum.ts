import DB from '../../db/db'
import { Forum } from '../models/forum_models';

class ForumRepository
{
    insertInto(forum: Forum): boolean {
        return DB.none(`INSERT INTO forums (slug, admin, title) VALUES ($1, $2, $3)`,
            [forum.slug, forum.adminId, forum.title])
            .then(() => true)
            .catch(() => false);
    }

    getBySlug(slug: string): Forum {
        return DB.one(`SELECT f.id, f.slug, u.nickname, f.title, f.threads, f.posts 
            FROM forums as f 
            JOIN users as u ON (u.id = f.admin) 
            WHERE lower(slug) = lower($1)`,
            [slug])
            .then((forum: Forum) => {
                forum.user = forum['nickname'];
                return forum;
            })
            .catch(() => null);
    }
}

export default new ForumRepository();
