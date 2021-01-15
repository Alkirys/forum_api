import ForumRepository from '../../forum/repository/posger_forum';
import ThreadRepository from '../../thread/repository/thread_repository';
import UserRepository from '../../user/repository/postgre_user';
import PostRepository from '../../post/repository/post_repository';
import VoteRepository from '../../vote/repository/vote_repository';
import { Thread } from '../models/thread_models';
import {Post} from "../../post/models/post_models";
import {Vote} from "../../vote/models/vote_model";

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';
const DATA_CONFLICT_ERROR = 'Data Conflict';

class ThreadUsecase {
    async addThread(thread: Thread): Promise<Thread> {
        const forum = await ForumRepository.getBySlug(thread.forum);
        if (forum === null) {
            throw new Error(FORUM_DOES_NOT_EXIST_ERROR);
        }
        const user = await UserRepository.getByNickname(thread.author);
        if (user === null) {
            throw new Error(USER_DOES_NOT_EXIST_ERROR);
        }

            let resultThread = await ThreadRepository.getBySlug(thread.slug);
            // console.log('THREAD11', resultThread)
            if (resultThread !== null) {
                resultThread.forum = resultThread.slug;
                resultThread.slug = resultThread.coalesce;
                resultThread.author = resultThread.nickname;
                return Promise.reject(resultThread);
            }


        thread.forum = forum.slug;
        thread.author = user.nickname;
        thread.authorId = user.id;
        thread.forumId = forum.id;

        const result = await ThreadRepository.insertInto(thread);
        return result;
    }

    async createPosts(slugOrId: string, posts: Post[]): Promise<Post[]> {
        // console.log('POSTS:',posts);
        let thread: Thread;

        const id = +slugOrId;
        if (isNaN(id)) {
            thread = await ThreadRepository.getBySlug(slugOrId);
        } else {
            thread = await ThreadRepository.getById(id);
        }
        // console.log('thread', thread)
        if (thread === null) {
            throw new Error(THREAD_DOES_NOT_EXIST_ERROR);
        }

        if (posts.length === 0) {// возможно позже поставить
            return [];
        }

        const res = await UserRepository.checkNicknames(posts);
        if (res !== null) {
            posts = res;
        } else {
            throw new Error(USER_DOES_NOT_EXIST_ERROR);
        }
        // CheckParent
        // console.log('POSTS2:',posts);
        const isParents = await PostRepository.checkParentPosts(posts, thread.id);
        // console.log('isParent:',isParents);
        if (!isParents) {
            throw new Error(DATA_CONFLICT_ERROR);
        }

        for (const post of posts) {
            post.threadId = thread.id;
            post.forum = thread.slug;
            post.forumId = +thread.forum;
        }

        try {
            const result = await PostRepository.insertInto(posts);
            if (result !== null) {
                return posts;
            }
            return null;
        } catch (e) {
            // console.log(e)
        }
    }

    async getBySlugOrId(slugOrId: string): Promise<Thread> {
        let thread: Thread;

        const id = +slugOrId;
        if (isNaN(id)) {
            thread = await ThreadRepository.getBySlug(slugOrId);
        } else {
            thread = await ThreadRepository.getById(id);
        }
        return thread;
    }

    async updateThread(slugOrId: string, thread: Thread): Promise<Thread> {
        let oldThread: Thread;

        const id = +slugOrId;
        if (isNaN(id)) {
            oldThread = await ThreadRepository.getBySlug(slugOrId);
        } else {
            oldThread = await ThreadRepository.getById(id);
        }
        if (oldThread === null) {
            throw Error(THREAD_DOES_NOT_EXIST_ERROR);
        }

        if (thread.message !== undefined && thread.message != '') {
            oldThread.message = thread.message;
        }
        if (thread.title !== undefined && thread.title != '') {
            oldThread.title = thread.title;
        }

        const response = await ThreadRepository.updateThread(oldThread);
        if (response !== null) {
            oldThread.votes = await VoteRepository.getThreadVotes(oldThread.id);
            // console.log(' VOTES: ', oldThread.votes);
            if (oldThread.votes > -1) {
                oldThread.forum = oldThread.slug;
                oldThread.slug = oldThread.coalesce;
                oldThread.author = oldThread.nickname;
                return oldThread;
            }
        }
        // console.log(' NOT OK !!! ', response);
        return null;
    }

    async vote(slugOrId: string, vote: Vote): Promise<Thread> {
        let oldThread: Thread;

        const id = +slugOrId;
        if (isNaN(id)) {
            oldThread = await ThreadRepository.getBySlug(slugOrId);
        } else {
            oldThread = await ThreadRepository.getById(id);
        }
        if (oldThread === null) {
            throw Error(THREAD_DOES_NOT_EXIST_ERROR);
        }

        const user = await UserRepository.getByNickname(vote.nickname);
        if (user === null) {
            throw Error(USER_DOES_NOT_EXIST_ERROR);
        }

        vote.threadId = oldThread.id;
        vote.userId = user.id;

        const result = await VoteRepository.insertInto(vote);
        if (result !== null) {
            oldThread.votes = await VoteRepository.getThreadVotes(oldThread.id);
            oldThread.forum = oldThread.slug;
            oldThread.slug = oldThread.coalesce;
            oldThread.author = oldThread.nickname;
            return oldThread;
        }
        return null;
    }

    async getThreadPosts(slugOrId: string, limit: number, since: number, sort: string, desc: boolean): Promise<Post[]> {
        let thread: Thread;

        const id = +slugOrId;
        if (isNaN(id)) {
            thread = await ThreadRepository.getBySlug(slugOrId);
        } else {
            thread = await ThreadRepository.getById(id);
        }
        if (thread === null) {
            throw Error(THREAD_DOES_NOT_EXIST_ERROR);
        }
        // console.log(thread);

        return await PostRepository.getByThread(thread.id, limit, since, sort, desc);
    }
}

export default new ThreadUsecase();
