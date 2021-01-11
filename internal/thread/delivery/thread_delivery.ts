import ThreadUsecase from "../usecase/thread_usecase";
import {Post} from "../../post/models/post_models";
import {Thread} from "../models/thread_models";

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';
const DATA_CONFLICT_ERROR = 'Data Conflict';

class ForumDelivery {
    async createPost(req, res) {
        const slugOrId = req.params.slug_or_id;
        let posts: Post[] = req.body || [];
        for (let post of posts) {
            post.parentId = post.parent;
        }

        try {
            const result = await ThreadUsecase.createPosts(slugOrId, posts);
            // console.log(result)

            res.code(201).send(result);
        } catch (e: any) {
            switch (e.message) {
                case USER_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: USER_DOES_NOT_EXIST_ERROR});
                    break;
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
                    break;
                case DATA_CONFLICT_ERROR:
                    res.code(409).send({ message: DATA_CONFLICT_ERROR});
                    break;
                default:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
                    break;
            }
            // console.log(e)
        }
    }

    async updateThead(req, res) {
        const slugOrId = req.params.slug_or_id;
        const thread = req.body;

        try {
            let result: Thread;
            if (Object.keys(thread).length !== 0) {
                result = await ThreadUsecase.updateThread(slugOrId, thread);
            } else {
                result = await ThreadUsecase.getBySlugOrId(slugOrId);
                result.forum = result.slug;
                result.slug = result.coalesce;
                result.author = result.nickname;
            }
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
                    break;
            }
            // console.log(' NOT OK updateThead(delivery) ', e);
        }
    }

    async getThreadDetails(req, res) {
        const slugOrId = req.params.slug_or_id;

        try {
            const result = await ThreadUsecase.getBySlugOrId(slugOrId);
            if (result === null) {
                res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
            } else {
                result.forum = result.slug;
                result.slug = result.coalesce;
                result.author = result.nickname;
                res.code(200).send(result);
            }
        } catch (e: any) {
            switch (e.message) {
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
                    break;
            }
            // console.log(e)
        }
    }

    async threadVote(req, res) {
        const slugOrId = req.params.slug_or_id;
        const vote = req.body;

        try {
            const result = await ThreadUsecase.vote(slugOrId, vote);
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
                    break;
                case USER_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: USER_DOES_NOT_EXIST_ERROR});
                    break;
            }
        }
    }

    async getThreadPosts(req, res) {
        const slugOrId = req.params.slug_or_id;
        const limit: number = req.query.limit;
        const since: number = req.query.since;
        const desc = req.query.desc === 'true';
        const sort: string = req.query.sort;

        try {
            const result = await ThreadUsecase.getThreadPosts(slugOrId, limit, since, sort, desc);
            // console.log('OK ', result);
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
            }
            // console.log(' NOT OK getThreadPosts(delivery) ', e);
        }
    }
}

export default new ForumDelivery();
