import ForumRepository from '../../forum/repository/posger_forum';
import ThreadRepository from '../../thread/repository/thread_repository';
import UserRepository from '../../user/repository/postgre_user';
import PostRepository from '../repository/post_repository';
import { Post, PostDetails } from '../models/post_models';

const USER_DOES_NOT_EXIST_ERROR = 'User does not exist';
const FORUM_DOES_NOT_EXIST_ERROR = 'Forum does not exist';
const THREAD_DOES_NOT_EXIST_ERROR = 'Thread does not exist';
const POST_DOES_NOT_EXIST_ERROR = 'Post does not exist';


class PostUsecase {
    async getPostDetails(id: number, related: string[]): Promise<PostDetails> {
        let postFull = {} as PostDetails;

        const post = await PostRepository.getById(id);
        if (post === null) {
            throw new Error(POST_DOES_NOT_EXIST_ERROR);
        }
        post.isEdited = post.isedited;

        postFull.post = post;

        // console.log(related)
        // console.log('POST:', post)
        for (const elem of related) {
            switch (elem) {
                case 'user':
                    const user = await UserRepository.getByNickname(post.author);
                    if (user === null) {
                        throw new Error(USER_DOES_NOT_EXIST_ERROR);
                    }
                    postFull.author = user;
                    break;
                case 'forum':
                    const forum = await ForumRepository.getBySlug(post.forum);
                    if (forum === null) {
                        throw new Error(FORUM_DOES_NOT_EXIST_ERROR);
                    }
                    postFull.forum = forum;
                    break;
                case 'thread':
                    const thread = await ThreadRepository.getById(post.thread);
                    if (thread === null) {
                        throw new Error(THREAD_DOES_NOT_EXIST_ERROR);
                    }
                    thread.forum = thread.slug;
                    thread.slug = thread.coalesce;
                    thread.author = thread.nickname;
                    postFull.thread = thread;
                    break;
            }
        }
        return postFull;
    }

    async updatePost(post: Post): Promise<Post> {
        const oldPost = await PostRepository.getById(post.id);
        if (oldPost === null) {
            throw new Error(POST_DOES_NOT_EXIST_ERROR);
        }
        if (post.message == '' || post.message === oldPost.message) {
            return oldPost;
        }

        oldPost.message = post.message;
        oldPost.edited = true;

        const updatedPost = await PostRepository.updatePost(oldPost);
        return updatedPost;
    }
}

export default new PostUsecase();
