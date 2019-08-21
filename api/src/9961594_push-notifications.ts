/**
 * @module push-notifications
 *
 * Functions to manage push notifications.
 *
 * Dependencies:
 *  - logging (9568346)
 *  - http (9568364)
 */

import * as logging from './9568346_logging';
import * as http from './9568364_http';

export const registerPushClient = async (
  device_token: string,
  device_type: string,
  data: { [key: string]: any }
) => {
  logging.logNotificationEvent('register_push_client_attempt', {
    deviceType: device_type
  });

  try {
    const response = await http.post('/push/web/register/', {
      device_token,
      device_type,
      ...data
    });
    logging.logNotificationEvent('register_push_client_success', {
      deviceType: device_type
    });
    return response;
  } catch (error) {
    logging.logNotificationErrorEvent('register_push_client_failed', error, {
      deviceType: device_type
    });
    throw error;
  }
};

export const setPushPreference = (preference: string, value: boolean) =>
  http.post('/push/web/update_settings/', { [preference]: value });
