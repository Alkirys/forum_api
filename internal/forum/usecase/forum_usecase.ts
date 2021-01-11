import ForumRepository from '../repository/posger_forum';
import ThreadRepository from '../../thread/repository/thread_repository';
import UserRepository from '../../user/repository/postgre_user';
import { Thread } from '../../thread/models/thread_models';
import { Forum } from '../models/forum_models';
import { User } from '../../user/models/user_models';

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';
const DATA_CONFLICT_ERROR = 'Data Conflict';

class ForumUsecase {
    async addForum(forum: Forum): Promise<Forum> {
        const existForum = await ForumRepository.getBySlug(forum.slug);

        const user = await UserRepository.getByNickname(forum.user);
        if (user === null) {
            throw new Error(USER_DOES_NOT_EXIST_ERROR);
        }

        if (existForum !== null) {
            existForum.user = user.nickname;
            return Promise.reject(existForum);
        }

        forum.user = user.nickname;
        forum.adminId = user.id;
        const isAllRight = await ForumRepository.insertInto(forum);
        if (!isAllRight) {
            return null;
        }
        return forum;
    }

    async getForumBySlug(slug: string): Promise<Forum> {
        const forum = await ForumRepository.getBySlug(slug);
        if (forum === null) {
            throw new Error(FORUM_DOES_NOT_EXIST_ERROR);
        }
        return forum;
    }

    async getForumThreads(slug: string, limit: number, since: string, desc: boolean): Promise<Thread[]> {
        const forum = await ForumRepository.getBySlug(slug);
        if (forum === null) {
            throw new Error(FORUM_DOES_NOT_EXIST_ERROR);
        }

        return await ThreadRepository.getByForumSlug(slug, limit, since, desc);
    }

    async getForumUsers(slug: string, limit: number, since: string, desc: boolean): Promise<User[]> {
        const forum = await ForumRepository.getBySlug(slug);
        if (forum === null) {
            throw new Error(FORUM_DOES_NOT_EXIST_ERROR);
        }

        return await UserRepository.getUsersByForum(forum.id, limit, since, desc);
    }
}

export default new ForumUsecase();
