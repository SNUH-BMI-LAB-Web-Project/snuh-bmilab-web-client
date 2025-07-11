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


import * as runtime from '../runtime';
import type {
  FilePresignedUrlResponse,
  FileSummary,
  UploadFileRequest,
} from '../models/index';
import {
    FilePresignedUrlResponseFromJSON,
    FilePresignedUrlResponseToJSON,
    FileSummaryFromJSON,
    FileSummaryToJSON,
    UploadFileRequestFromJSON,
    UploadFileRequestToJSON,
} from '../models/index';

export interface DeleteFileRequest {
    fileId: string;
}

export interface GeneratePresignedUrlRequest {
    domainType: GeneratePresignedUrlDomainTypeEnum;
    fileName: string;
    contentType: string;
}

export interface UploadFileOperationRequest {
    uploadFileRequest: UploadFileRequest;
}

/**
 * 
 */
export class FileApi extends runtime.BaseAPI {

    /**
     */
    async deleteFileRaw(requestParameters: DeleteFileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        if (requestParameters['fileId'] == null) {
            throw new runtime.RequiredError(
                'fileId',
                'Required parameter "fileId" was null or undefined when calling deleteFile().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("JWT", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/files/{fileId}`.replace(`{${"fileId"}}`, encodeURIComponent(String(requestParameters['fileId']))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     */
    async deleteFile(requestParameters: DeleteFileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.deleteFileRaw(requestParameters, initOverrides);
    }

    /**
     * AWS S3에 파일을 업로드하기 위한 Presigned URL을 발급받는 GET API
     * Presigned URL 발급
     */
    async generatePresignedUrlRaw(requestParameters: GeneratePresignedUrlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FilePresignedUrlResponse>> {
        if (requestParameters['domainType'] == null) {
            throw new runtime.RequiredError(
                'domainType',
                'Required parameter "domainType" was null or undefined when calling generatePresignedUrl().'
            );
        }

        if (requestParameters['fileName'] == null) {
            throw new runtime.RequiredError(
                'fileName',
                'Required parameter "fileName" was null or undefined when calling generatePresignedUrl().'
            );
        }

        if (requestParameters['contentType'] == null) {
            throw new runtime.RequiredError(
                'contentType',
                'Required parameter "contentType" was null or undefined when calling generatePresignedUrl().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['domainType'] != null) {
            queryParameters['domainType'] = requestParameters['domainType'];
        }

        if (requestParameters['fileName'] != null) {
            queryParameters['fileName'] = requestParameters['fileName'];
        }

        if (requestParameters['contentType'] != null) {
            queryParameters['contentType'] = requestParameters['contentType'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("JWT", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/files/presigned-url`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FilePresignedUrlResponseFromJSON(jsonValue));
    }

    /**
     * AWS S3에 파일을 업로드하기 위한 Presigned URL을 발급받는 GET API
     * Presigned URL 발급
     */
    async generatePresignedUrl(requestParameters: GeneratePresignedUrlRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FilePresignedUrlResponse> {
        const response = await this.generatePresignedUrlRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * S3 업로드 후 DB에 첨부파일 정보를 저장하기 위한 POST API
     * (S3 업로드 후) 첨부파일 정보 저장
     */
    async uploadFileRaw(requestParameters: UploadFileOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<FileSummary>> {
        if (requestParameters['uploadFileRequest'] == null) {
            throw new runtime.RequiredError(
                'uploadFileRequest',
                'Required parameter "uploadFileRequest" was null or undefined when calling uploadFile().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("JWT", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/files`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: UploadFileRequestToJSON(requestParameters['uploadFileRequest']),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => FileSummaryFromJSON(jsonValue));
    }

    /**
     * S3 업로드 후 DB에 첨부파일 정보를 저장하기 위한 POST API
     * (S3 업로드 후) 첨부파일 정보 저장
     */
    async uploadFile(requestParameters: UploadFileOperationRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<FileSummary> {
        const response = await this.uploadFileRaw(requestParameters, initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const GeneratePresignedUrlDomainTypeEnum = {
    Project: 'PROJECT',
    Timeline: 'TIMELINE',
    Report: 'REPORT'
} as const;
export type GeneratePresignedUrlDomainTypeEnum = typeof GeneratePresignedUrlDomainTypeEnum[keyof typeof GeneratePresignedUrlDomainTypeEnum];
