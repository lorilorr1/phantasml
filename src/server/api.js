/**
 * API types shared between client and server.
 *
 * @module server/api
 * @flow
 */

// flow-runtime doesn't recognize this in the module comment
// @flow-runtime enable

import t, {reify} from 'flow-runtime';
import type {Type} from 'flow-runtime';

export type ApiRequest = {authToken?: string};

export type UserStatusRequest = ApiRequest;
export const UserStatusRequestType = (reify: Type<UserStatusRequest>);
export type AnonymousResponse = {
  type: 'anonymous',
  allowAnonymous: ?boolean,
  canCreateUser: ?boolean,
};
export type LoggedInResponse = {
  type: 'logged-in',
  externalId: string,
  authToken?: string,
  persistAuthToken?: boolean,
  displayName: ?string,
  imageUrl: ?string,
  admin: ?boolean,
  passwordReset?: ?boolean,
  transfer?: ?boolean,
};
export type UserStatusResponse = AnonymousResponse | LoggedInResponse;

type PasswordLoginRequest = ApiRequest & {
  type: 'password',
  email: string,
  password: string,
  stayLoggedIn: boolean,
};
type GoogleLoginRequest = ApiRequest & {
  type: 'google',
  idToken: string,
};
type FacebookLoginRequest = ApiRequest & {
  type: 'facebook',
  accessToken: string,
};
export type ExternalLoginRequest = GoogleLoginRequest | FacebookLoginRequest;
export type UserLoginRequest = PasswordLoginRequest | ExternalLoginRequest;
export const UserLoginRequestType = (reify: Type<UserLoginRequest>);
export type UserLoginResponse = LoggedInResponse;

export type UserLogoutRequest = ApiRequest;
export const UserLogoutRequestType = (reify: Type<UserLogoutRequest>);
export type UserLogoutResponse = AnonymousResponse;

export type UserCreateRequest = ApiRequest & {email: string, locale: string};
export const UserCreateRequestType = (reify: Type<UserCreateRequest>);
export type UserCreateResponse = {};

type PasswordSetupRequest = ApiRequest & {
  type: 'password',
  displayName: string,
  password: string,
  stayLoggedIn: boolean,
};
export type UserSetupRequest = PasswordSetupRequest | ExternalLoginRequest;
export const UserSetupRequestType = (reify: Type<UserSetupRequest>);
export type UserSetupResponse = LoggedInResponse;

export type UserPasswordResetRequest = ApiRequest & {
  email: string,
  locale: string,
};
export const UserPasswordResetRequestType = (reify: Type<
  UserPasswordResetRequest,
>);
export type UserPasswordResetResponse = {};

export type UserPasswordRequest = ApiRequest & {
  password: string,
  stayLoggedIn: boolean,
};
export const UserPasswordRequestType = (reify: Type<UserPasswordRequest>);
export type UserPasswordResponse = LoggedInResponse;

export type UserConfigureRequest = ApiRequest & {
  displayName: string,
  password: string,
};
export const UserConfigureRequestType = (reify: Type<UserConfigureRequest>);
export type UserConfigureResponse = LoggedInResponse;

type EmailTransferRequest = ApiRequest & {
  type: 'email',
  email: string,
  locale: string,
};
export type UserTransferRequest = EmailTransferRequest | ExternalLoginRequest;
export const UserTransferRequestType = (reify: Type<UserTransferRequest>);
export type UserTransferResponse = LoggedInResponse | {type: 'email'};

export type UserCompleteTransferRequest = UserPasswordRequest;
export const UserCompleteTransferRequestType = (reify: Type<
  UserCompleteTransferRequest,
>);
export type UserCompleteTransferResponse = LoggedInResponse;

export type UserDeleteRequest = ApiRequest;
export const UserDeleteRequestType = (reify: Type<UserDeleteRequest>);
export type UserDeleteResponse = AnonymousResponse;

export type AdminGetSettingsRequest = ApiRequest;
export const AdminGetSettingsRequestType = (reify: Type<
  AdminGetSettingsRequest,
>);
export type AdminGetSettingsResponse = {
  allowAnonymous: ?boolean,
  canCreateUser: ?boolean,
};

export type AdminPutSettingsRequest = ApiRequest & {
  allowAnonymous: boolean,
  canCreateUser: boolean,
};
export const AdminPutSettingsRequestType = (reify: Type<
  AdminPutSettingsRequest,
>);
export type AdminPutSettingsResponse = {};

export type AdminInviteRequest = ApiRequest & {
  addresses: string[],
  locale: string,
};
export const AdminInviteRequestType = (reify: Type<AdminInviteRequest>);
export type AdminInviteResponse = {};

export type ResourceType = 'environment';

export type ResourceListRequest = ApiRequest;
export const ResourceListRequestType = (reify: Type<ResourceListRequest>);
export type ResourceListResponse = {};

export type ResourceCreateRequest = ApiRequest & {type: ResourceType};
export const ResourceCreateRequestType = (reify: Type<ResourceCreateRequest>);
export type ResourceCreateResponse = {id: string};

export type ResourceGetRequest = ApiRequest & {id: string};
export const ResourceGetRequestType = (reify: Type<ResourceGetRequest>);
export type ResourceGetResponse = {};

export type ResourcePutRequest = ApiRequest & {id: string};
export const ResourcePutRequestType = (reify: Type<ResourcePutRequest>);
export type ResourcePutResponse = {};

export type ResourceDeleteRequest = ApiRequest & {id: string};
export const ResourceDeleteRequestType = (reify: Type<ResourceDeleteRequest>);
export type ResourceDeleteResponse = {};
