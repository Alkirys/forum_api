import DB from '../../db/db'
import { Vote } from '../models/vote_model';

class VoteRepository
{
    insertInto(vote: Vote): Vote {
        return DB.one(`SELECT id FROM votes WHERE thread = $1 and author = $2`,
            [vote.threadId, vote.userId])
            .then((res: { id: number }) => {
                // console.log('1!!!!!! then')
                return DB.none('UPDATE votes SET vote = $2 WHERE id = $1',
                    [res.id, vote.voice])
                    .then(() => {return vote})
                    .catch((e) => {return null});
            })
            .catch(() => {
                // console.log('3!!!!!! catch')
                return DB.none('INSERT INTO votes (author, thread, vote) VALUES ($1, $2, $3)',
                    [vote.userId, vote.threadId, vote.voice])
                    .then(() => {return vote})
                    .catch((e) => {return null});
            });
    }

    getThreadVotes(id: number): number {
        return DB.one(`SELECT votes FROM threads WHERE id = $1`,
            [id])
            .then((res: { votes: number }) => res.votes)
            .catch((e) => {return -1});
    }
}

export default new VoteRepository();
