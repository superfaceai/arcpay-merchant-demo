const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const deliveryDate = ({
  deliveryMinDays,
  deliveryMaxDays,
  sendAtHour,
  receiveAtHour,
  now = new Date(),
}: {
  deliveryMinDays: number;
  deliveryMaxDays: number;
  sendAtHour: number;
  receiveAtHour: number;
  now?: Date;
}): { earliest: Date; latest: Date } => {
  let sendDate = new Date();

  if (now.getHours() > 13) {
    // if the current hour is after 1PM, will send the next day
    sendDate = new Date(sendDate.getTime() + DAY);
    sendDate.setHours(sendAtHour, 0, 0, 0);
  }

  // if saturday, add 2 days
  if (sendDate.getDay() === 6) {
    sendDate = new Date(sendDate.getTime() + 2 * DAY);
  }

  // if sunday, add 1 day
  if (sendDate.getDay() === 0) {
    sendDate = new Date(sendDate.getTime() + DAY);
  }

  const earliest = new Date(sendDate.getTime() + deliveryMinDays * DAY);
  earliest.setHours(sendAtHour, 0, 0, 0);
  const latest = new Date(sendDate.getTime() + deliveryMaxDays * DAY);
  latest.setHours(receiveAtHour, 0, 0, 0);

  return { earliest, latest };
};
