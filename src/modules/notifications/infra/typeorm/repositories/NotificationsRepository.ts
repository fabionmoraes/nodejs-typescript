import { getMongoRepository, MongoRepository } from 'typeorm';

import Notification from '../schemas/Notification';
import INotificationsRepository from '../../../services/INotificationsRepository';
import ICreateNotificationDTO from '../../../dtos/ICreateNotificationDTO';

class NotificationsRepository implements INotificationsRepository {
  private ormNotification: MongoRepository<Notification>;

  constructor() {
    this.ormNotification = getMongoRepository(Notification, 'mongo');
  }

  public async create({ content, recipient_id }: ICreateNotificationDTO): Promise<Notification> {
    const notification = this.ormNotification.create({ content, recipient_id });

    return notification;
  }
}

export default NotificationsRepository;
