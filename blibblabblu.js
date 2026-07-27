// Name: Profanity Checker
// ID: profanityChecker
// Description: Check text for profanity using the vector.profanity.dev API.
// License: MIT
// This extension follows the Gandi IDE custom extension format, which is
// largely compatible with TurboWarp's extension format.
// Load it in Gandi via Extensions > Custom > "load from URL", or install it
// as a project file per the Gandi custom-extension docs.

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    // The extension needs to make network requests (fetch), which requires
    // it to run unsandboxed.
    throw new Error('Profanity Checker extension must run unsandboxed');
  }

  const API_URL = 'https://vector.profanity.dev';

  // Cache results so repeated checks on the same text in the same frame
  // don't spam the API.
  const cache = new Map();

  /**
   * Calls the vector.profanity.dev API.
   * @param {string} message
   * @returns {Promise<{isProfanity: boolean, score: number, flaggedFor?: string, error?: string}>}
   */
  async function checkProfanity(message) {
    message = String(message ?? '');

    if (message.trim().length === 0) {
      return { isProfanity: false, score: 0 };
    }

    if (cache.has(message)) {
      return cache.get(message);
    }

    let result;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      if (!res.ok) {
        result = { isProfanity: false, score: 0, error: data.error || `HTTP ${res.status}` };
      } else {
        result = {
          isProfanity: !!data.isProfanity,
          score: typeof data.score === 'number' ? data.score : 0,
          flaggedFor: data.flaggedFor
        };
      }
    } catch (err) {
      result = { isProfanity: false, score: 0, error: err.message || 'Network error' };
    }

    cache.set(message, result);
    // Don't let the cache grow forever.
    if (cache.size > 200) {
      cache.delete(cache.keys().next().value);
    }

    return result;
  }

  class ProfanityChecker {
    getInfo() {
      return {
        id: 'profanityChecker',
        name: 'Profanity Checker',
        color1: '#FF6680',
        color2: '#FF4D6A',
        color3: '#E63950',
        blocks: [
          {
            opcode: 'isProfanity',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is [TEXT] profanity?',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello world'
              }
            }
          },
          {
            opcode: 'profanityScore',
            blockType: Scratch.BlockType.REPORTER,
            text: 'profanity score of [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello world'
              }
            }
          },
          {
            opcode: 'flaggedWord',
            blockType: Scratch.BlockType.REPORTER,
            text: 'what flagged [TEXT] as profanity',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello world'
              }
            }
          },
          '---',
          {
            opcode: 'lastError',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last profanity check error'
          }
        ]
      };
    }

    async isProfanity(args) {
      const result = await checkProfanity(args.TEXT);
      this._lastError = result.error || '';
      return result.isProfanity;
    }

    async profanityScore(args) {
      const result = await checkProfanity(args.TEXT);
      this._lastError = result.error || '';
      return result.score;
    }

    async flaggedWord(args) {
      const result = await checkProfanity(args.TEXT);
      this._lastError = result.error || '';
      return result.flaggedFor || '';
    }

    lastError() {
      return this._lastError || '';
    }
  }

  Scratch.extensions.register(new ProfanityChecker());
})(Scratch);
