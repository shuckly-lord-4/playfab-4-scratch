// Name: Webhook Sender
// ID: webhookSender
// Description: Configure and send Discord-style webhooks (title, description,
//              footer, color, author/username, etc).
// License: MIT
// Gandi IDE custom extension format (compatible with TurboWarp's format).

(function (Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    // Needs to run unsandboxed to make network requests (fetch).
    throw new Error('Webhook Sender extension must run unsandboxed');
  }

  class WebhookSender {
    constructor() {
      // Webhook target
      this.webhookUrl = '';

      // "Sender" identity (shows at the top of the Discord message, above the embed)
      this.username = '';
      this.avatarUrl = '';

      // Plain message content (shown above the embed, outside of it)
      this.content = '';

      // Embed fields
      this.title = '';
      this.description = '';
      this.color = '#5865F2'; // Discord blurple, as a sane default
      this.footerText = '';
      this.footerIcon = '';
      this.authorName = '';
      this.authorIcon = '';
      this.authorUrl = '';
      this.thumbnailUrl = '';
      this.imageUrl = '';
      this.url = '';

      this._lastStatus = '';
      this._lastError = '';
    }

    getInfo() {
      return {
        id: 'webhookSender',
        name: 'Webhook Sender',
        color1: '#5865F2',
        color2: '#4752C4',
        color3: '#3C45A5',
        blocks: [
          {
            opcode: 'setWebhookUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set webhook URL to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: 'https://discord.com/api/webhooks/...' }
            }
          },
          '---',
          {
            opcode: 'setUsername',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set webhook sender name to [NAME]',
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'My Bot' }
            }
          },
          {
            opcode: 'setAvatarUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set webhook sender avatar to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'setContent',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set message content to [TEXT]',
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          '---',
          {
            opcode: 'setTitle',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed title to [TEXT]',
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Title' }
            }
          },
          {
            opcode: 'setDescription',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed description to [TEXT]',
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'Description' }
            }
          },
          {
            opcode: 'setColor',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed color to [HEX]',
            arguments: {
              HEX: { type: Scratch.ArgumentType.COLOR, defaultValue: '#5865F2' }
            }
          },
          {
            opcode: 'setUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed title link to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          '---',
          {
            opcode: 'setAuthorName',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed author name to [TEXT]',
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'setAuthorIcon',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed author icon to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'setAuthorUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed author link to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          '---',
          {
            opcode: 'setFooterText',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed footer text to [TEXT]',
            arguments: {
              TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'setFooterIcon',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed footer icon to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          '---',
          {
            opcode: 'setThumbnailUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed thumbnail to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          {
            opcode: 'setImageUrl',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set embed image to [URL]',
            arguments: {
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: '' }
            }
          },
          '---',
          {
            opcode: 'sendWebhook',
            blockType: Scratch.BlockType.COMMAND,
            text: 'send webhook'
          },
          {
            opcode: 'resetEmbed',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset webhook fields'
          },
          '---',
          {
            opcode: 'lastStatus',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last webhook status'
          },
          {
            opcode: 'lastError',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last webhook error'
          }
        ]
      };
    }

    // --- setters -----------------------------------------------------------

    setWebhookUrl(args) {
      this.webhookUrl = String(args.URL ?? '');
    }

    setUsername(args) {
      this.username = String(args.NAME ?? '');
    }

    setAvatarUrl(args) {
      this.avatarUrl = String(args.URL ?? '');
    }

    setContent(args) {
      this.content = String(args.TEXT ?? '');
    }

    setTitle(args) {
      this.title = String(args.TEXT ?? '');
    }

    setDescription(args) {
      this.description = String(args.TEXT ?? '');
    }

    setColor(args) {
      this.color = String(args.HEX ?? '#5865F2');
    }

    setUrl(args) {
      this.url = String(args.URL ?? '');
    }

    setAuthorName(args) {
      this.authorName = String(args.TEXT ?? '');
    }

    setAuthorIcon(args) {
      this.authorIcon = String(args.URL ?? '');
    }

    setAuthorUrl(args) {
      this.authorUrl = String(args.URL ?? '');
    }

    setFooterText(args) {
      this.footerText = String(args.TEXT ?? '');
    }

    setFooterIcon(args) {
      this.footerIcon = String(args.URL ?? '');
    }

    setThumbnailUrl(args) {
      this.thumbnailUrl = String(args.URL ?? '');
    }

    setImageUrl(args) {
      this.imageUrl = String(args.URL ?? '');
    }

    resetEmbed() {
      this.content = '';
      this.title = '';
      this.description = '';
      this.color = '#5865F2';
      this.url = '';
      this.authorName = '';
      this.authorIcon = '';
      this.authorUrl = '';
      this.footerText = '';
      this.footerIcon = '';
      this.thumbnailUrl = '';
      this.imageUrl = '';
    }

    // --- sending -------------------------------------------------------------

    hexToInt(hex) {
      if (!hex) return 0;
      const clean = String(hex).replace('#', '');
      const parsed = parseInt(clean, 16);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    async sendWebhook() {
      if (!this.webhookUrl) {
        this._lastError = 'No webhook URL set.';
        this._lastStatus = 'error';
        return;
      }

      const embed = {};
      if (this.title) embed.title = this.title;
      if (this.description) embed.description = this.description;
      if (this.url) embed.url = this.url;
      if (this.color) embed.color = this.hexToInt(this.color);

      if (this.authorName) {
        embed.author = { name: this.authorName };
        if (this.authorIcon) embed.author.icon_url = this.authorIcon;
        if (this.authorUrl) embed.author.url = this.authorUrl;
      }

      if (this.footerText) {
        embed.footer = { text: this.footerText };
        if (this.footerIcon) embed.footer.icon_url = this.footerIcon;
      }

      if (this.thumbnailUrl) embed.thumbnail = { url: this.thumbnailUrl };
      if (this.imageUrl) embed.image = { url: this.imageUrl };

      const payload = {};
      if (this.content) payload.content = this.content;
      if (this.username) payload.username = this.username;
      if (this.avatarUrl) payload.avatar_url = this.avatarUrl;
      if (Object.keys(embed).length > 0) payload.embeds = [embed];

      try {
        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        this._lastStatus = String(res.status);

        if (!res.ok) {
          let errText = `HTTP ${res.status}`;
          try {
            const data = await res.json();
            errText = data.message || JSON.stringify(data);
          } catch (_) {
            // response wasn't JSON, ignore
          }
          this._lastError = errText;
        } else {
          this._lastError = '';
        }
      } catch (err) {
        this._lastStatus = 'error';
        this._lastError = err.message || 'Network error';
      }
    }

    lastStatus() {
      return this._lastStatus;
    }

    lastError() {
      return this._lastError;
    }
  }

  Scratch.extensions.register(new WebhookSender());
})(Scratch);
