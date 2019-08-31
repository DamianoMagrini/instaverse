/// <reference path="index.d.ts" />

/**
 * @module service-worker
 *
 * Functions for managing the service worker.
 *
 * - user-agent (9568276)
 * - environment-metadata (9502827)
 * - notification-constants (12714051)
 * - logging (9568346)
 * - invariant-ex (9502825)
 * - expect-non-null (9568264)
 * - mid (9699338)
 * - direct-support (9830532)
 * - get-qe (9568383)
 * - push-notifications (9961594)
 * - translations-cache (14876714)
 * - get-string (9568260)
 * - store-logging-params (14876715)
 * - qs (former 14876716, now node_module)
 * - config (9568270)
 */

import * as user_agent from './9568276_user-agent';
import environment_metadata from './9502827_environment-metadata';
import * as NOTIFICATION_CONSTANTS from './12714051_notification-constants';
import * as logging from './9568346_logging';
import invariant_ex from './9502825_invariant-ex';
import expect_non_null from './9568264_expect-non-null';
import * as mid from './9699338_mid';
import * as direct_support from './9830532_direct-support';
import * as get_qe from './9568383_get-qe';
import * as push_notifications from './9961594_push-notifications';
import * as translations_cache from './14876714_translations-cache';
import get_string from './9568260_get-string';
import * as store_logging_params from './14876715_store-logging-params';
import qs from 'qs';
import * as config from './9568270_config';

export const getSupportedFeatures = () => {
  const chromeEncryptedPush =
    user_agent.isBrowser('Chrome >= 50') &&
    (user_agent.isDesktop() || user_agent.isOS('Android'));

  const serviceWorker =
    'serviceWorker' in navigator &&
    'ready' in navigator.serviceWorker &&
    ServiceWorkerRegistration &&
    (user_agent.isUCBrowser() ||
      user_agent.isFirefox() ||
      ServiceWorkerRegistration.prototype.hasOwnProperty('navigationPreload'));

  return {
    chromeEncryptedPush,
    serviceWorker,
    notifications:
      serviceWorker &&
      'PushManager' in window &&
      'Notification' in window &&
      'fetch' in window &&
      ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification') &&
      PushSubscription.prototype.hasOwnProperty('getKey')
  };
};

const get_notification_permission_granted = () =>
  !user_agent.isIgLite() &&
  environment_metadata.canUseDOM &&
  Notification &&
  Notification.permission ===
    NOTIFICATION_CONSTANTS.NOTIFICATION_PERMISSION.granted;

const wait_until_permission_granted = async (): Promise<void> => {
  if (
    Notification &&
    Notification.permission ===
      NOTIFICATION_CONSTANTS.NOTIFICATION_PERMISSION.granted
  )
    return;
  else
    return new Promise((resolve, reject) => {
      const log_notification_prompt_result = (
        permission: NotificationPermission
      ) => {
        if (
          permission === NOTIFICATION_CONSTANTS.NOTIFICATION_PERMISSION.granted
        ) {
          logging.logAction_DEPRECATED('notificationsPromptAllow');
          resolve();
        } else if (
          permission === NOTIFICATION_CONSTANTS.NOTIFICATION_PERMISSION.denied
        ) {
          logging.logAction_DEPRECATED('notificationsPromptDeny');
          reject();
        } else {
          logging.logAction_DEPRECATED('notificationsPromptDefer');
          reject();
        }
      };

      const permission_request = Notification.requestPermission(
        (notification_permission) => {
          if (!permission_request)
            log_notification_prompt_result(notification_permission);
        }
      );
      if (permission_request)
        permission_request.then(log_notification_prompt_result);
    });
};

export const initalizePush = (source: string) => {
  invariant_ex(!user_agent.isIgLite());
  logging.logNotificationEvent('init_push_attempt', { source });

  if (getSupportedFeatures().notifications) {
    Notification.permission ===
      NOTIFICATION_CONSTANTS.NOTIFICATION_PERMISSION.default &&
      logging.logAction_DEPRECATED('notificationsPromptShown', { source });
    Promise.all([
      wait_until_permission_granted(),
      expect_non_null(navigator.serviceWorker).ready
    ])
      .then(([, registration]) => {
        if (registration)
          registration.pushManager
            .subscribe({ userVisibleOnly: true })
            .then((subscription) => {
              logging.logNotificationEvent(
                'init_push_subscribed_to_push_manager',
                { source }
              );
              const { endpoint } = subscription;
              const endpoint_path_components = endpoint.split('/');

              let subscription_keys: Record<string, string>;
              if (subscription.toJSON)
                subscription_keys = subscription.toJSON().keys;
              else if ('keys' in subscription)
                subscription_keys = (subscription as PushSubscription & {
                  keys: Record<string, string>;
                }).keys;

              const push_client_data: {
                mid: string;
                subscription_keys?: string;
              } = {
                mid: mid.getMID()
              };

              if (typeof subscription_keys === 'object')
                push_client_data.subscription_keys = JSON.stringify(
                  subscription_keys
                );

              let last_endpoint_path_component =
                endpoint_path_components[endpoint_path_components.length - 1];
              let is_encrypted = false;
              const { chromeEncryptedPush } = getSupportedFeatures();

              if (user_agent.isFirefox()) {
                is_encrypted = true;
                last_endpoint_path_component = endpoint;
              } else if (direct_support.hasDirect({ silent: true })) {
                is_encrypted = true;
              } else if (chromeEncryptedPush) {
                is_encrypted = get_qe._('2', '0') as boolean;
                push_notifications.registerPushClient(
                  last_endpoint_path_component,
                  is_encrypted ? 'web_encrypted' : 'web',
                  push_client_data
                );
              }
            })
            .catch((error) => {
              logging.logNotificationErrorEvent(
                'init_push_push_manager_sub_failed',
                error,
                { source }
              );
            });
        else
          logging.logNotificationEvent('init_push_failed', {
            reason: 'no_sw_after_permission_acquired',
            source
          });
      })
      .catch((error) => {
        console.log('Unable to get permission to notify'),
          logging.logNotificationErrorEvent(
            'request_permission_failed',
            error,
            { source }
          );
      });
  } else
    logging.logNotificationEvent('init_push_failed', {
      reason: 'notif_not_supported',
      source
    });
};

const get_service_worker_flavor = (): string => {
  let release_channel: string = null;
  if (window.location.hostname === 'preprod.instagram.com')
    release_channel = 'preprod';
  else if (config.isCanary()) release_channel = 'canary';
  else release_channel = 'prod';

  const bundle_variant = config.getBundleVariant();
  if (bundle_variant) release_channel += `-${bundle_variant}`;

  return release_channel;
};

export const captureInstallPrompt = function() {
  if (environment_metadata.canUseDOM)
    // Note that A2HS stands for 'add to home screen'
    window.addEventListener('beforeinstallprompt', (a2hs_prompt) => {
      a2hs_prompt.preventDefault();
      window.defferedA2HSPrompt = a2hs_prompt;
      return false;
    });
};

export const register = (sw_query: any) => {
  if (getSupportedFeatures().serviceWorker) {
    const sw_flavor = get_service_worker_flavor();

    Promise.all([
      translations_cache.storeTranslations({ pushBody: get_string(1079) }),
      store_logging_params.storeLoggingParams()
    ])
      .then(() => {
        const sw_query_string = qs.stringify(sw_query);
        return (
          logging.logNotificationEvent('sw_reg_cache_store_succeeded'),
          navigator.serviceWorker.register(
            `/service-worker-${sw_flavor}.js?${sw_query_string}`,
            {
              scope: '/'
            }
          )
        );
      })
      .then((registration) => {
        logging.logNotificationEvent('sw_reg_success');
        registration.addEventListener('updatefound', () => {
          const installing_service_worker = registration.installing;
          if (installing_service_worker) {
            logging.logNotificationEvent('sw_update_found', {
              state: installing_service_worker.state
            }),
              installing_service_worker.addEventListener(
                'statechange',
                (event) => {
                  logging.logNotificationEvent('sw_state_changed', {
                    state: (event.target as EventTarget & {
                      state: any;
                    }).state
                  });
                }
              );
          } else {
            logging.logNotificationEvent('sw_update_found_no_new_worker');
          }
        });

        if (get_notification_permission_granted()) initalizePush('sw_reg');
        else if (user_agent.isIgLite())
          logging.logNotificationEvent('sw_reg_no_push_ig_lite');
        else logging.logNotificationEvent('sw_reg_no_push_not_granted');
      })
      .catch((t) => {
        logging.logNotificationErrorEvent('sw_reg_cache_store_failed', t);
      });
  } else logging.logNotificationEvent('sw_reg_unsupported');
};

export const unregister = function() {
  if (environment_metadata.canUseDOM && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });

    if (window.caches && window.caches.keys && window.caches.delete)
      window.caches.keys().then((cache_names) => {
        cache_names.forEach((cache_name) => {
          window.caches.delete(cache_name);
        });
      });
  }
};
