import AxiosBase from './axios/AxiosBase'
import { buildApiFailureError, normalizeApiError } from './apiError'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiEnvelope, ApiSuccess } from '@/@types/api'

const ApiService = {
    async fetchEnvelopeWithAxios<
        Response = unknown,
        Request = Record<string, unknown>,
    >(param: AxiosRequestConfig<Request>) {
        try {
            const response = await AxiosBase.request<
                ApiEnvelope<Response>,
                AxiosResponse<ApiEnvelope<Response>>,
                Request
            >(param)

            const payload = response.data

            if (!payload.exito) {
                throw buildApiFailureError(payload, response.status)
            }

            return payload as ApiSuccess<Response>
        } catch (error) {
            throw normalizeApiError(error)
        }
    },
    async fetchDataWithAxios<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
    ) {
        const envelope = await ApiService.fetchEnvelopeWithAxios<Response, Request>(param)
        return envelope.datos
    },
}

export default ApiService
