import { User } from '../../user/models/user_models';
import { Forum } from '../../forum/models/forum_models';
import { Thread } from '../../thread/models/thread_models';

export interface Post {
    author?: string;
    created?: string;
    forum?: string;
    id?: number;
    edited?: boolean;
    message?: string;
    parentId?: number;
    parent?: number;
    threadId?: number;
    forumId?: number;
    authorId?: number;
    thread?: number;
    isEdited?: boolean;
    isedited?: boolean;
}

export interface PostDetails {
    author : User;
    forum: Forum;
    post: Post;
    thread: Thread;
}
