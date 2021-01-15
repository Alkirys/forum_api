import UserUsecase from "../usecase/user_usecase";
import { User } from '../models/user_models';

class UserDelivery {
    async createUser(req, res) {
        try {
            const nickname = req.params.nickname;
            const user = req.body;
            // console.log('IN:', user);
            const users = await UserUsecase.addUser(nickname, user);
            if (users === null) {
                res.code(500).send({ message: 'Bad Request' });
            }
            if (Array.isArray(users)) {
                res.code(409).send(JSON.stringify(users));
            } else {
                // console.log('OUT:', users);
                res.code(201).send(users);
            }
        } catch (e) {
            // console.log(e)
        }

    }

    async updateUser(req, res) {
        /*
        UPDATE USER
        OPTIONS:
        CHANGED -> 200 RETURN USER
        EMAIL EXISTST -> 409 RETURN ERROR
        NICKNAME EXISTS -> 409 RETURN ERROR
        NO USER -> 404 NOT FOUND
        BAD INPUT -> 400
        OTHER -> 400
       */
        const nickname = req.params.nickname;
        const user = req.body;

        try {
            const response = await UserUsecase.updateUser(nickname, user);
            if (response === null) {
                res.code(404).send({ message: 'User doesn\'t exist'});
            } else {
                res.code(200).send(response);
            }
        } catch (e: any) {
            if (e.message === '') {
                res.code(500).send({ message: 'Bad Request' });
            } else {
                res.code(409).send({ message: 'Data Conflict' });
            }
        }
    }

    async getUser(req, res) {
        const nickname = req.params.nickname;

        const user = await UserUsecase.getByNickname(nickname);
        // console.log('getUser(deliv):', user);
        if (user === null) {
            res.code(404).send({ message: 'User does not exist'});
        } else {
            res.code(200).send(user);
        }
    }
}

export default new UserDelivery();
