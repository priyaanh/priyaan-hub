/* Runs the on-device tutor model off the page's main thread, so loading and answering never freeze the
   page. Only used over http(s): browsers do not start workers from file:// pages. */
import { WebWorkerMLCEngineHandler } from 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = msg => handler.onmessage(msg);
