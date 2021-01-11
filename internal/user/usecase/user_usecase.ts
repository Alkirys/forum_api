import UserRepository from '../repository/postgre_user';
import { User } from '../models/user_models';

const USER_EXIST_ERROR = 'User already exists';

class UserUsecase {
    async addUser(nickname: string, user: User): Promise<User[] | User> {
        const userByNickname = await UserRepository.getByNickname(nickname);
        const userByEmail = await UserRepository.getByEmail(user.email);

        if (userByNickname !== null || userByEmail !== null) {
            let users: User[] = [];
            if (userByNickname !== null) {
                users.push(userByNickname);
                if (userByEmail !== null && userByEmail.nickname !== userByNickname.nickname) {
                    users.push(userByEmail);
                }
            } else if (userByEmail !== null) {
                users.push(userByEmail);
            }
            return users;
        }

        user.nickname = nickname;
        const isAllRight = await UserRepository.insertInto(user);
        if (!isAllRight) {
            return null;
        }
        return user;
    }

    async getByNickname(nickname: string): Promise<User> {
        return await UserRepository.getByNickname(nickname);
    }

    async updateUser(nickname: string, user: User): Promise<User | Error> {
        const userByNickname = await UserRepository.getByNickname(nickname);

        const userByEmail = await UserRepository.getByEmail(user.email);

        if (userByNickname === null) {
            return null;
        }

        if (userByEmail !== null && user.nickname !== userByEmail.nickname) {
            throw new Error(USER_EXIST_ERROR);
        }

        user.nickname = nickname;
        if (user.email === undefined || user.email === '') {
            user.email = userByNickname.email;
        }
        if (user.fullname === undefined || user.fullname === '') {
            user.fullname = userByNickname.fullname;
        }
        if (user.about === undefined || user.about === '') {
            user.about = userByNickname.about;
        }
        const res = await UserRepository.updateUser(user);
        if (!res) {
            throw new Error('');
        }
        return user;
    }
}

export default new UserUsecase();
