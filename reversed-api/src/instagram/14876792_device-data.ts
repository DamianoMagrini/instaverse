/**
 * @module device-data
 *
 * Functions to get info about the device and its connection.
 *
 * Dependencies: none
 */

interface DeviceData {
  num_cores?: number;
  ram_gb?: number;
  downlink_megabits?: number;
  effective_connection_type?: string;
  rtt_ms?: number;
}

type WithDeviceData<Keys extends string> = { [key in Keys]: any } & DeviceData;

const device_data = {
  addCommonValues: <Keys extends string>(
    obj: { [key in Keys]: any }
  ): WithDeviceData<Keys> => {
    if (navigator && navigator.hardwareConcurrency !== undefined)
      (obj as WithDeviceData<Keys>).num_cores = navigator.hardwareConcurrency;
    if (navigator && navigator.deviceMemory)
      (obj as WithDeviceData<Keys>).ram_gb = navigator.deviceMemory;
    if (navigator && navigator.connection) {
      if (typeof navigator.connection.downlink === 'number')
        (obj as WithDeviceData<Keys>).downlink_megabits =
          navigator.connection.downlink;
      if (typeof navigator.connection.effectiveType === 'string')
        (obj as WithDeviceData<Keys>).effective_connection_type =
          navigator.connection.effectiveType;
      if (typeof navigator.connection.rtt === 'number')
        (obj as WithDeviceData<Keys>).rtt_ms = navigator.connection.rtt;
    }
    return obj as WithDeviceData<Keys>;
  },

  getCommonData: () => device_data.addCommonValues({})
};

export default device_data;
