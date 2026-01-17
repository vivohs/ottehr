import Oystehr, { OystehrConfig } from '@oystehr/sdk';

export type EhrProvider = 'oystehr' | 'fhir-rest';

export interface EhrClient {
  fhir: {
    get: <T>(input: FhirGetInput) => Promise<T>;
    search: <T>(input: FhirSearchInput) => Promise<FhirBundleResult<T>>;
    create: <T>(resource: T) => Promise<T>;
    update: <T>(resource: T) => Promise<T>;
    patch: <T>(input: FhirPatchInput) => Promise<T>;
    delete: (input: FhirDeleteInput) => Promise<void>;
    transaction: <T>(input: FhirBundleInput) => Promise<FhirBundleResult<T>>;
    batch: <T>(input: FhirBundleInput) => Promise<FhirBundleResult<T>>;
  };
}

export interface FhirSearchParam {
  name: string;
  value: string;
}

export interface FhirSearchInput {
  resourceType: string;
  params?: FhirSearchParam[];
}

export interface FhirGetInput {
  resourceType: string;
  id: string;
}

export interface FhirPatchInput {
  resourceType: string;
  id: string;
  operations: unknown;
}

export interface FhirDeleteInput {
  resourceType: string;
  id: string;
}

export interface FhirBundleInput {
  requests: unknown[];
}

export interface FhirBundleEntry<T> {
  resource: T;
}

export interface FhirBundle<T> {
  resourceType: 'Bundle';
  entry?: FhirBundleEntry<T>[];
}

export type FhirBundleResult<T> = FhirBundle<T> & {
  unbundle: () => T[];
};

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/$/, '');

const ensureBundleResult = <T>(bundle: FhirBundle<T>): FhirBundleResult<T> => ({
  ...bundle,
  unbundle: () => (bundle.entry ?? []).map((entry) => entry.resource),
});

export class FhirRestClient implements EhrClient {
  private readonly baseUrl: string;
  private readonly accessToken: string | undefined;
  private readonly headers: Record<string, string>;

  constructor(params: { baseUrl: string; accessToken?: string; headers?: Record<string, string> }) {
    this.baseUrl = normalizeBaseUrl(params.baseUrl);
    this.accessToken = params.accessToken;
    this.headers = params.headers ?? {};
  }

  public readonly fhir = {
    get: async <T>(input: FhirGetInput): Promise<T> => {
      return this.request<T>('GET', `/${input.resourceType}/${input.id}`);
    },
    search: async <T>(input: FhirSearchInput): Promise<FhirBundleResult<T>> => {
      const query = this.toQueryString(input.params ?? []);
      const bundle = await this.request<FhirBundle<T>>('GET', `/${input.resourceType}${query}`);
      return ensureBundleResult(bundle);
    },
    create: async <T>(resource: T): Promise<T> => {
      const resourceType = (resource as { resourceType?: string }).resourceType;
      if (!resourceType) {
        throw new Error('FHIR resourceType is required to create a resource.');
      }
      return this.request<T>('POST', `/${resourceType}`, resource);
    },
    update: async <T>(resource: T): Promise<T> => {
      const { resourceType, id } = resource as { resourceType?: string; id?: string };
      if (!resourceType || !id) {
        throw new Error('FHIR resourceType and id are required to update a resource.');
      }
      return this.request<T>('PUT', `/${resourceType}/${id}`, resource);
    },
    patch: async <T>(input: FhirPatchInput): Promise<T> => {
      return this.request<T>('PATCH', `/${input.resourceType}/${input.id}`, input.operations, {
        'Content-Type': 'application/json-patch+json',
      });
    },
    delete: async (input: FhirDeleteInput): Promise<void> => {
      await this.request('DELETE', `/${input.resourceType}/${input.id}`);
    },
    transaction: async <T>(input: FhirBundleInput): Promise<FhirBundleResult<T>> => {
      const bundle = await this.request<FhirBundle<T>>('POST', '/', {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: input.requests,
      });
      return ensureBundleResult(bundle);
    },
    batch: async <T>(input: FhirBundleInput): Promise<FhirBundleResult<T>> => {
      const bundle = await this.request<FhirBundle<T>>('POST', '/', {
        resourceType: 'Bundle',
        type: 'batch',
        entry: input.requests,
      });
      return ensureBundleResult(bundle);
    },
  };

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...extraHeaders,
    };
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`FHIR request failed: ${response.status} ${response.statusText} - ${message}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private toQueryString(params: FhirSearchParam[]): string {
    if (!params.length) {
      return '';
    }
    const searchParams = new URLSearchParams();
    params.forEach((param) => searchParams.append(param.name, param.value));
    return `?${searchParams.toString()}`;
  }
}

export interface CreateEhrClientInput {
  provider: EhrProvider;
  accessToken: string;
  fhirApiUrl: string;
  projectApiUrl?: string;
  headers?: Record<string, string>;
}

export const createEhrClient = (input: CreateEhrClientInput): EhrClient => {
  if (input.provider === 'oystehr') {
    const config: OystehrConfig = {
      accessToken: input.accessToken,
      fhirApiUrl: input.fhirApiUrl,
      projectApiUrl: input.projectApiUrl ?? '',
    };
    return new Oystehr(config);
  }

  return new FhirRestClient({
    baseUrl: input.fhirApiUrl,
    accessToken: input.accessToken,
    headers: input.headers,
  });
};
