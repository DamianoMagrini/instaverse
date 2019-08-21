/**
 * @module uri-schemes
 *
 * A function to check whether a certain URI scheme is allowed (i.e. it is a
 * scheme used by a Facebook app).
 *
 * Dependencies: none
 */

import array_to_object from './14942222_array-to-object';

const allowed_protocols = array_to_object([
  'blob',
  'fb',
  'fb-ama',
  'fb-messenger',
  'fb-page-messages',
  'fbcf',
  'fbconnect',
  'fbmobilehome',
  'fbrpc',
  'file',
  'ftp',
  'http',
  'https',
  'mailto',
  'ms-app',
  'instagram',
  'intent',
  'itms',
  'itms-apps',
  'itms-services',
  'market',
  'svn+ssh',
  'fbstaging',
  'tel',
  'sms',
  'pebblejs',
  'sftp',
  'whatsapp'
]);

export const isAllowed = (protocol: string) =>
  !protocol || allowed_protocols.hasOwnProperty(protocol.toLowerCase());
