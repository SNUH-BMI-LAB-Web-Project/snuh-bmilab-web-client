/* tslint:disable */
/* eslint-disable */
/**
 * BMI-LAB Web API
 * BMI-LAB을 관리하기 위한 웹 서비스
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { UserSummary } from './UserSummary';
import {
    UserSummaryFromJSON,
    UserSummaryFromJSONTyped,
    UserSummaryToJSON,
    UserSummaryToJSONTyped,
} from './UserSummary';

/**
 * 
 * @export
 * @interface LoginResponse
 */
export interface LoginResponse {
    /**
     * JWT 엑세스 토큰
     * @type {string}
     * @memberof LoginResponse
     */
    accessToken?: string;
    /**
     * 로그인한 사용자 요약 정보
     * @type {UserSummary}
     * @memberof LoginResponse
     */
    user?: UserSummary;
    /**
     * 사용자 역할
     * @type {string}
     * @memberof LoginResponse
     */
    role?: LoginResponseRoleEnum;
}


/**
 * @export
 */
export const LoginResponseRoleEnum = {
    User: 'USER',
    Admin: 'ADMIN'
} as const;
export type LoginResponseRoleEnum = typeof LoginResponseRoleEnum[keyof typeof LoginResponseRoleEnum];


/**
 * Check if a given object implements the LoginResponse interface.
 */
export function instanceOfLoginResponse(value: object): value is LoginResponse {
    return true;
}

export function LoginResponseFromJSON(json: any): LoginResponse {
    return LoginResponseFromJSONTyped(json, false);
}

export function LoginResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): LoginResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'accessToken': json['accessToken'] == null ? undefined : json['accessToken'],
        'user': json['user'] == null ? undefined : UserSummaryFromJSON(json['user']),
        'role': json['role'] == null ? undefined : json['role'],
    };
}

export function LoginResponseToJSON(json: any): LoginResponse {
    return LoginResponseToJSONTyped(json, false);
}

export function LoginResponseToJSONTyped(value?: LoginResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'accessToken': value['accessToken'],
        'user': UserSummaryToJSON(value['user']),
        'role': value['role'],
    };
}

