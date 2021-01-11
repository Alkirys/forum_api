import user from './internal/user/delivery/user_delivery';
import forum from './internal/forum/delivery/forum_delivery';
import thread from './internal/thread/delivery/thread_delivery';
import post from './internal/post/delivery/post_delivery';
import service from './internal/service/delivery/service_delivery';

const port: number = 5000;

const app = require('fastify')({});

app.addContentTypeParser('application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
        if (body.length > 0) {
            done(null, JSON.parse(body));
        } else {
            done(null, {});
        }
    });

app.listen(port, '0.0.0.0', () => {
    console.log(`Started on port ${port}`);
});

app.post('/api/user/:nickname/create', user.createUser);
app.get('/api/user/:nickname/profile', user.getUser);
app.post('/api/user/:nickname/profile', user.updateUser);
app.post('/api/forum/create', forum.createForum);
app.get('/api/forum/:slug/details', forum.getForumDatails);
app.post('/api/forum/:slug/create', forum.createThead);
app.get('/api/forum/:slug/threads', forum.getForumThreads);
app.get('/api/forum/:slug/users', forum.getForumUsers);
app.post('/api/thread/:slug_or_id/create', thread.createPost);
app.post('/api/thread/:slug_or_id/vote', thread.threadVote);
app.get('/api/thread/:slug_or_id/details', thread.getThreadDetails);
app.get('/api/thread/:slug_or_id/posts', thread.getThreadPosts);
app.post('/api/thread/:slug_or_id/details', thread.updateThead);
app.get('/api/post/:id/details', post.getPostDetails);
app.post('/api/post/:id/details', post.updatePost);
app.get('/api/service/status', service.getStatus);
app.post('/api/service/clear', service.clear);
