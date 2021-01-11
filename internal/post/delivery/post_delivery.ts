import PostUsecase from "../usecase/post_usecase";
import { Post } from "../models/post_models";

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';

class PostDelivery {
    async updatePost(req, res) {
        const id = req.params.id;
        let post = req.body;

        try {
            let response: Post;
            if (Object.keys(post).length !== 0) {
                post.id = id;
                response = await PostUsecase.updatePost(post);
            } else {
                const details = await PostUsecase.getPostDetails(id, []);
                response = details.post;
            }
            // console.log(response);
            res.code(200).send(response);
        } catch (e: any) {
            if (e.message === POST_DOES_NOT_EXIST_ERROR) {
                res.code(404).send({ message: POST_DOES_NOT_EXIST_ERROR });
            } else {
                // console.log('ERROR:', e)
                res.code(500).send({ message: 'Bad Request' });
            }
        }
    }

    async getPostDetails(req, res) {
        const id = req.params.id;
        const relatedStr = req.query.related;
        let related: string[];
        if (relatedStr === undefined) {
            related = [];
        } else {
            related = (<string>relatedStr).split(',');
        }

        try {
            const response = await PostUsecase.getPostDetails(id, related);
            res.code(200).send(response);
        } catch (e: any) {
            if (e.message === POST_DOES_NOT_EXIST_ERROR) {
                res.code(404).send({ message: POST_DOES_NOT_EXIST_ERROR });
            } else {
                // console.log('ERROR:', e)
                res.code(500).send({ message: 'Bad Request' });
            }
        }
    }
}

export default new PostDelivery();
