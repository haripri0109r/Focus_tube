export type MessageType = 
  | 'GET_CONTEXT'
  | 'SESSION_START'
  | 'SESSION_PAUSE'
  | 'SESSION_RESUME'
  | 'SESSION_END'
  | 'SESSION_FLUSH_STATS'
  | 'SESSION_UPDATE_KEYWORDS'
  | 'EXPAND_KEYWORDS'
  | 'OPEN_OPTIONS';

export interface BaseMessage {
  type: MessageType;
  tabId?: number;
}
