import ForumUsecase from "../usecase/forum_usecase";
import ThreadUsecase from "../../thread/usecase/thread_usecase";

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';
const DATA_CONFLICT_ERROR = 'Data Conflict';

class ForumDelivery {
    async createForum(req, res) {
        const forum = req.body

        try {
            const result = await ForumUsecase.addForum(forum);
            res.code(201).send(result);
        } catch (e: any) {
            switch (e.message) {
                case USER_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: USER_DOES_NOT_EXIST_ERROR});
                    break;
                case FORUM_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
                    break;
                case DATA_CONFLICT_ERROR:
                    res.code(409).send({ message: DATA_CONFLICT_ERROR});
                    break;
            }
            if ('slug' in e) { // можно пооптимизировать
                res.code(409).send(e);
            }
        }
    }

    async createThead(req, res) {
        const slug = req.params.slug;
        let thread = req.body;
        thread.forum = slug;
        // возможно, нужна проверка времени
        // console.log('createThread')

        try {
            const result = await ThreadUsecase.addThread(thread);
            res.code(201).send(result);
        } catch (e: any) {
            switch (e.message) {
                case USER_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: USER_DOES_NOT_EXIST_ERROR});
                    break;
                case FORUM_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
                    break;
                case THREAD_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: THREAD_DOES_NOT_EXIST_ERROR});
                    break;
                case DATA_CONFLICT_ERROR:
                    res.code(409).send({ message: DATA_CONFLICT_ERROR});
                    break;
            }
            if (e.slug !== undefined) {
                res.code(409).send(e);
            }
        }
    }

    async getForumDatails(req, res) {
        const slug = req.params.slug;

        try {
            const result = await ForumUsecase.getForumBySlug(slug);
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case FORUM_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
                    break;
            }
        }
    }

    async getForumThreads(req, res) {
        const slug = req.params.slug;
        const limit = req.query.limit;
        const since = req.query.since;
        const desc = req.query.desc === 'true';

        try {
            const result = await ForumUsecase.getForumThreads(slug, limit, since, desc);
            // console.log('OK ', result);
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case FORUM_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
            }
            // console.log(' NOT OK ', e);
        }
    }

    async getForumUsers(req, res) {
        const slug = req.params.slug;
        const limit = req.query.limit || 100;
        const since = req.query.since;
        const desc = req.query.desc === 'true';

        try {
            const result = await ForumUsecase.getForumUsers(slug, limit, since, desc);
            // console.log(' NOT OK ', result);
            res.code(200).send(result);
        } catch (e: any) {
            switch (e.message) {
                case FORUM_DOES_NOT_EXIST_ERROR:
                    res.code(404).send({ message: FORUM_DOES_NOT_EXIST_ERROR});
            }
            // console.log(' NOT OK ', e);
        }
    }
}

export default new ForumDelivery();
