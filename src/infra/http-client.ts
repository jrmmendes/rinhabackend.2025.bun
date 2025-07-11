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
    const url = ''.concat(this.config.baseUrl).concat(path)
    const payload = {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        ...this.config.headers,
      }
    }

    console.log('HttpClient > post request to %s with body: %s', url, JSON.stringify(body))

    const response = await fetch(url, payload)

    console.log('HttpClient > response for request to %s: %s', url, response.status)

    return [ 
      response.status,
      await response.json() as TData,
      this.config.validateStatus(response.status)
    ]
  }
}
