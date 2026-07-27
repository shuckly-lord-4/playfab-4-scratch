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
            opcode: 'checkProfanity',
            blockType: Scratch.BlockType.REPORTER,
            text: 'check profanity of [TEXT]',
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'hello world'
              }
            }
          }
        ]
      };
    }

    async checkProfanity(args) {
      const message = String(args.TEXT ?? '');

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        const data = await res.json();

        if (!res.ok) {
          return JSON.stringify({ error: data.error || `HTTP ${res.status}` });
        }

        return JSON.stringify(data);
      } catch (err) {
        return JSON.stringify({ error: err.message || 'Network error' });
      }
    }
  }

  Scratch.extensions.register(new ProfanityChecker());
})(Scratch);
