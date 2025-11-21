import { WSMessage } from '../shared/types';
export class WSClient {
  ws: WebSocket | null = null;
  url: string;
  onMsg: (m: WSMessage) => void = () => {};
  constructor(url: string) { this.url = url; }
  connect(qs: string) {
    this.ws = new WebSocket(this.url + '?' + qs);
    this.ws.onmessage = (ev) => { try { this.onMsg(JSON.parse(ev.data)); } catch {} };
    this.ws.onopen = () => {};
    this.ws.onclose = () => { setTimeout(() => { this.connect(qs); }, 1000); };
  }
  send(m: WSMessage) { try { this.ws?.send(JSON.stringify(m)); } catch {} }
}
