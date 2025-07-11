type HttpClientConfig = {
  baseUrl: string;
  headers: Record<string, string>;
  validateStatus: (status: number) => boolean, 
}

export class HttpClient {
  config: HttpClientConfig;

  constructor(config: Partial<HttpClientConfig> = {}) {
    this.config = {
      validateStatus: (status) => status > 0 && status <= 399,
      baseUrl: '', 
      headers: {},
      ...config
    };
  }

  async post<TData= unknown, TBody = undefined>(path: string, body?: TBody): Promise<[status: number, data: TData, error: boolean]> {
    console.log('HttpClient > post request to %s with body: %s', path, JSON.stringify(body))
    const url = ''.concat(this.config.baseUrl).concat(path)
    const payload = {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        ...this.config.headers,
      }
    }

    const response = await fetch(url, payload)

    return [ 
      response.status,
      await response.json() as TData,
      this.config.validateStatus(response.status)
    ]
  }
}
