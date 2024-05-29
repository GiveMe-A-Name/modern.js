import type {
  Logger,
  Metrics,
  Reporter,
  CoreMonitor,
  LogEvent,
  MonitorEvent,
  LogLevel,
  Monitors,
} from '@modern-js/types';
import { time } from '@modern-js/runtime-utils/time';
import { ServerReportTimings } from '../constants';
import type { Context, Next, ServerEnv } from '../../core/server';

const defaultReporter: Reporter = {
  init() {
    // noImpl
  },
  reportError() {
    // noImpl
  },
  reportTiming() {
    // noImpl
  },
  reportInfo() {
    // noImpl
  },
  reportWarn() {
    // noImpl
  },
};

// TODO: unify
export function injectReporter() {
  return async (c: Context<ServerEnv>, next: Next) => {
    const reporter = c.get('reporter');
    if (!reporter) {
      c.set('reporter', defaultReporter);
    }
    await next();
  };
}

export function initReporter(entryName: string) {
  return async (c: Context<ServerEnv>, next: Next) => {
    const reporter = c.get('reporter');

    if (!reporter) {
      await next();
      return;
    }

    await reporter.init({ entryName });

    // reporter global timeing
    const getCost = time();

    await next();

    const cost = getCost();
    reporter.reportTiming(ServerReportTimings.SERVER_HANDLE_REQUEST, cost);
  };
}

export function injectLogger(inputLogger: Logger) {
  return async (c: Context<ServerEnv>, next: Next) => {
    const logger = c.get('logger');
    if (!logger && inputLogger) {
      c.set('logger', inputLogger);
    }
    await next();
  };
}

export function injectMetrics(inputMetrics: Metrics) {
  return async (c: Context<ServerEnv>, next: Next) => {
    const metrics = c.get('metrics');

    if (!metrics) {
      c.set('metrics', inputMetrics);
    }

    await next();
  };
}

class MonitorsImpl implements Monitors {
  #monitors: CoreMonitor[] = [];

  push(monitor: CoreMonitor) {
    this.#monitors.push(monitor);
  }

  info(message: string, ...args: any[]) {
    this.#log('info', message, args);
  }

  debug(message: string, ...args: any[]) {
    this.#log('debug', message, args);
  }

  warn(message: string, ...args: any[]) {
    this.#log('warn', message, args);
  }

  error(message: string, ...args: any[]) {
    this.#log('error', message, args);
  }

  emitTimer(name: string, dur: number, desc?: string) {
    this.emit({
      type: 'timing',
      payload: {
        name,
        dur,
        desc,
      },
    });
  }

  emit(event: MonitorEvent) {
    this.#monitors.forEach(m => m(event));
  }

  #log(logLevel: LogLevel, message: string, args: any[]) {
    const e: LogEvent = {
      type: 'log',
      payload: {
        level: logLevel,
        message,
        splat: args,
      },
    };

    this.emit(e);
  }
}

type Var = {
  monitors: Monitors;
};

interface Env {
  Variables: Var;
}

export function getMonitors(c: Context<Env>) {
  const monitors = c.get('monitors');

  if (monitors) {
    return monitors;
  } else {
    const monitors = new MonitorsImpl();

    monitors.emit({
      type: 'timing',
      payload: {
        name: '',
        dur: 10,
        desc: 'hlkjasdlkj',
      },
    });
    c.set('monitors', monitors);

    return monitors;
  }
}
