/**
 * @module quick-performance-logger
 *
 * QuickPerformanceLogger, a utility to log performance. Quickly.
 *
 * Dependencies:
 *  - qpl-config (14876787)
 *  - event-constants (14876788)
 *  - random (9699358)
 *  - get-current-timestamp (14876789)
 *  - get-navigation-start (14876790)
 *  - falco-log (14876791)
 *  - device-data (14876792)
 */

import QPL_CONFIG from './14876787_qpl-config';
import event_constants from './14876788_event-constants';
import * as random from './9699358_random';
import get_current_timestamp from './14876789_get-current-timestamp';
import get_navigation_start_timestamp from './14876790_get-navigation-start-timestamp';
import FalcoLog from './14876791_falco-log';
import device_data from './14876792_device-data';

export default class QuickPerformanceLogger {
  private markers: {
    [id: number]: {
      [index: number]: {
        sampleRate: number;
        timestamp?: number;
        annotations?: { [key: string]: string };
        annotationsStringArray?: { [key: string]: string[] };
        annotationsInt?: { [key: string]: number };
        annotationsIntArray?: { [key: string]: number[] };
        annotationsDouble?: { [key: string]: number };
        annotationsDoubleArray?: { [key: string]: number[] };
        points?: { [id: string]: { data: any; timeSinceStart: number } };
      };
    };
  };
  private sample_rates: { [key: string]: any };
  private default_sample_rate: number;
  private callbacks: {
    onMarkerStart?: (
      marker_id: number,
      index: number,
      timestamp: number
    ) => void;
    onMarkerEnd?: (
      marker_id: number,
      instance_id: number,
      timestamp: number
    ) => void;
  };
  private get_data(marker_id: number, index: number) {
    if (QPL_CONFIG.killswitch) return null;
    const marker = this.markers[marker_id];
    if (!marker) return null;
    const sample_rate = marker[index];
    return sample_rate || null;
  }
  private log_with_metadata(data: { [key: string]: any }) {
    data = this.add_metadata(data);
    FalcoLog.log(() => data);
  }
  private add_metadata(data: { [key: string]: any }) {
    const common_device_data = device_data.getCommonData();
    data.metadata = {
      memory_stats: {
        total_mem: common_device_data.ram_gb
          ? 1073741824 * common_device_data.ram_gb
          : null
      },
      network_stats: {
        downlink_megabits: common_device_data.downlink_megabits,
        network_subtype: common_device_data.effective_connection_type,
        rtt_ms: common_device_data.rtt_ms
      }
    };
    return data as {
      metadata: {
        memory_stats: {
          total_mem: number;
        };
        network_stats: {
          downlink_megabits: number;
          network_subtype: string;
          rtt_ms: number;
        };
      };
      [key: string]: any;
    };
  }

  constructor(
    callbacks: {
      onMarkerStart?: (
        marker_id: number,
        index: number,
        timestamp: number
      ) => void;
      onMarkerEnd?: (
        marker_id: number,
        instance_id: number,
        timestamp: number
      ) => void;
    } = {}
  ) {
    this.markers = {};
    this.sample_rates = {};
    this.default_sample_rate = 1000;
    this.callbacks = callbacks;
  }

  markerStart(
    marker_id: number,
    index = 0,
    timestamp = this.currentTimestamp()
  ) {
    if (QPL_CONFIG.killswitch) return;
    const s = event_constants[marker_id.toString()];
    if (!s) return;
    const sampleRate = this.__computeSampleRate(
      this.sample_rates[marker_id],
      s.sampleRate,
      this.default_sample_rate
    );
    if (!random.coinflip(sampleRate)) return;
    if (!this.markers[marker_id]) this.markers[marker_id] = {};
    this.markers[marker_id][index] = {
      timestamp,
      sampleRate,
      points: {}
    };
    if (this.callbacks.onMarkerStart)
      this.callbacks.onMarkerStart(marker_id, index, timestamp);
  }

  annotateMarkerString(
    marker_id: number,
    annotation_index: string,
    annotation_content: string,
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotations = data.annotations || {};
    annotations[annotation_index] = annotation_content;
    data.annotations = annotations;
  }
  annotateMarkerStringArray(
    marker_id: number,
    annotation_index: string,
    annotation_content: string[],
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotationsStringArray = data.annotationsStringArray || {};
    annotationsStringArray[annotation_index] = annotation_content;
    data.annotationsStringArray = annotationsStringArray;
  }
  annotateMarkerInt(
    marker_id: number,
    annotation_index: string,
    annotation_content: number,
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotationsInt = data.annotationsInt || {};
    annotationsInt[annotation_index] = annotation_content;
    data.annotationsInt = annotationsInt;
  }
  annotateMarkerIntArray(
    marker_id: number,
    annotation_index: string,
    annotation_content: number[],
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotationsIntArray = data.annotationsIntArray || {};
    annotationsIntArray[annotation_index] = annotation_content;
    data.annotationsIntArray = annotationsIntArray;
  }
  annotateMarkerDouble(
    marker_id: number,
    annotation_index: string,
    annotation_content: number,
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotationsDouble = data.annotationsDouble || {};
    annotationsDouble[annotation_index] = annotation_content;
    data.annotationsDouble = annotationsDouble;
  }
  annotateMarkerDoubleArray(
    marker_id: number,
    annotation_index: string,
    annotation_content: number[],
    sample_index = 0
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (!data) return;
    const annotationsDoubleArray = data.annotationsDoubleArray || {};
    annotationsDoubleArray[annotation_index] = annotation_content;
    data.annotationsDoubleArray = annotationsDoubleArray;
  }

  markerPoint(
    marker_id: number,
    point_name: string,
    point_data: any,
    sample_index = 0,
    timestamp = this.currentTimestamp()
  ) {
    const data = this.get_data(marker_id, sample_index);
    if (data)
      data.points[point_name] = {
        data: point_data,
        timeSinceStart: timestamp - data.timestamp
      };
  }
  markerEnd(
    marker_id: number,
    action_id: number,
    instance_id = 0,
    timestamp = this.currentTimestamp()
  ) {
    const data = this.get_data(marker_id, instance_id);
    if (!data || !event_constants[marker_id.toString()]) return;
    if (this.callbacks.onMarkerEnd)
      this.callbacks.onMarkerEnd(marker_id, instance_id, timestamp);
    const timestamp_difference = timestamp - data.timestamp;
    const { points } = data;
    this.log_with_metadata({
      marker_id,
      instance_id,
      action_id,
      sample_rate: data.sampleRate,
      value: Math.round(timestamp_difference),
      annotations: data.annotations,
      annotations_double: data.annotationsDouble,
      annotations_double_array: data.annotationsDoubleArray,
      annotations_int: data.annotationsInt,
      annotations_int_array: data.annotationsIntArray,
      annotations_string_array: data.annotationsStringArray,
      points: Object.keys(points).map((point_name) => ({
        data: {
          string:
            null != points[point_name].data
              ? { __key: points[point_name].data }
              : null
        },
        name: point_name,
        timeSinceStart: Math.round(points[point_name].timeSinceStart)
      }))
    });
    delete this.markers[marker_id][instance_id];
  }
  markerDrop(marker_id: number, index = 0) {
    const marker = this.markers[marker_id];
    if (marker) delete marker[index];
  }
  dropAllMarkers() {
    this.markers = {};
  }
  setAlwaysOnSampleRate(key: string | number, value: any) {
    this.sample_rates[key] = value;
  }
  setSampleRateForInstance(marker_id: number, sample_rate: number, index = 0) {
    const marker = this.markers[marker_id][index];
    if (marker) marker.sampleRate = sample_rate;
  }
  __computeSampleRate = (
    sample_1: number,
    sample_2: number,
    sample_3: number
  ) => sample_1 || sample_2 || sample_3;
  currentTimestamp() {
    return get_current_timestamp();
  }
  navigationStartTimestamp = () => get_navigation_start_timestamp();
}
