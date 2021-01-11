import ServiceRepository from '../repository/service_repository';
import { Status } from '../models/service_models';

class ServiceUsecase {
    async getStatus(): Promise<Status> {
        let status = {} as Status;
        status.forum =  await ServiceRepository.getCountForum();
        status.post = await ServiceRepository.getCountPost();
        status.thread = await ServiceRepository.getCountThread();
        status.user = await ServiceRepository.getCountUser();

        for (const key in status) {
            status[key] = +status[key];
            if (status[key] < 0) {
                return null;
            }
        }
        return status;
    }

    async deleteAll(): Promise<boolean> {
        let sum = 0;
        sum += await ServiceRepository.deleteVotes();
        sum += await ServiceRepository.deletePosts();
        sum += await ServiceRepository.deleteThreads();
        sum += await ServiceRepository.deleteForums();
        sum += await ServiceRepository.deleteUsers();

        return sum === 5;
    }
}

export default new ServiceUsecase();
