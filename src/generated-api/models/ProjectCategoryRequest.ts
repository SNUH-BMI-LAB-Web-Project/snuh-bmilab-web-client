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
/**
 * 
 * @export
 * @interface ProjectCategoryRequest
 */
export interface ProjectCategoryRequest {
    /**
     * 연구 분야 이름
     * @type {string}
     * @memberof ProjectCategoryRequest
     */
    name: string;
}

/**
 * Check if a given object implements the ProjectCategoryRequest interface.
 */
export function instanceOfProjectCategoryRequest(value: object): value is ProjectCategoryRequest {
    if (!('name' in value) || value['name'] === undefined) return false;
    return true;
}

export function ProjectCategoryRequestFromJSON(json: any): ProjectCategoryRequest {
    return ProjectCategoryRequestFromJSONTyped(json, false);
}

export function ProjectCategoryRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): ProjectCategoryRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'name': json['name'],
    };
}

export function ProjectCategoryRequestToJSON(json: any): ProjectCategoryRequest {
    return ProjectCategoryRequestToJSONTyped(json, false);
}

export function ProjectCategoryRequestToJSONTyped(value?: ProjectCategoryRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'name': value['name'],
    };
}

