import { injectable, inject } from 'tsyringe';

import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';

interface Request {
  provider_id: string;
  day: number;
  month: number;
  year: number;
}

@injectable()
class ListProviderAppointmentsService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({ provider_id, day, month, year }: Request): Promise<Appointment[]> {
    const cacheKey = `provider-appointment:${provider_id}:${year}-${month}-${day}`;

    // let appointments = await this.cacheProvider.recover<Appointment[]>(cacheKey);
    let appointments;

    if (!appointments) {
      appointments = await this.appointmentsRepository.findAllInDayFromProvider({
        provider_id,
        day,
        month,
        year,
      });

      await this.cacheProvider.save(cacheKey, appointments);
    }

    // await this.cacheProvider.save('asd', 'asd');

    return appointments;
 }
}

export default ListProviderAppointmentsService;
