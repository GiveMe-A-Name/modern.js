/* eslint-disable @typescript-eslint/method-signature-style */
type LogLevel = 'warn' | 'error' | 'debug' | 'info';

export interface LogEvent {
  type: 'log';
  payload: {
    level: LogLevel;
    message: string;
    splat?: any[];
  };
}

export interface TimingEvent {
  type: 'timing';
  payload: {
    name: string;
    dur: number;
    desc?: string;
  };
}

export interface StatsEvent {
  type: 'counter';
  payload: {
    name: string;
    value: number;
    [key: string]: unknown;
  };
}

export type MonitorEvent = LogEvent | TimingEvent | StatsEvent;

export type CoreMonitor = (event: MonitorEvent) => void;

export interface Monitors {
  push(m: CoreMonitor): void;

  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;

  emitTimer(name: string, dur: number, desc?: string): void;
  emit(event: MonitorEvent): void;
}
