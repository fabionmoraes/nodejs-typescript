import { startOfDay, isBefore, getHours, format } from 'date-fns';
import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';
import INotificationsRepository from '@modules/notifications/services/INotificationsRepository';

interface IRequest {
  provider_id: string;
  user_id: string;
  date: Date;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,
    ) {}

  public async execute({ provider_id, user_id, date }: IRequest): Promise<Appointment> {
    const appointmentDate = startOfDay(date);

    if (isBefore(appointmentDate, Date.now())) {
      throw new AppError("You cant't create appointment on a past date.");
    }

    if (user_id === provider_id) {
      throw new AppError("You can't create an appointment with yourself.");
    }

    // if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
    //   throw new AppError("You can only appointments between 8am and 5pm.");
    // }

    const findAppointmentsInSameDate = await this.appointmentsRepository.findByDate(
      appointmentDate
    );

    if (findAppointmentsInSameDate) {
      throw new AppError('this appointment is already booked');
    }

    const appointment = await this.appointmentsRepository.create({
      provider_id,
      user_id,
      date: appointmentDate,
    });

    const dateFormatted = format(new Date(), "dd/MM/yyyy 'às' HH:mm'h'");

    await this.notificationsRepository.create({
      recipient_id: provider_id,
      content: `Novo agendamento para ${dateFormatted}`,
    });

    return appointment;
  }

}

export default CreateAppointmentService;
