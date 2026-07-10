(function(Scratch) {
  'use strict';

  const icon = 'https://developer.playfab.com/React/img/playfab-mark.DOA-oZnA.png';

  class Playfab {
    constructor() {
      this.titleId = '';
      this.secretKey = '';
      this.sessionTicket = '';
      this.masterPlayerId = '';
      this.titlePlayerId = '';
      this.lastLinkResult = 'No link attempted yet';
      this.displayName = 'Unknown';
      this.loggedIn = false;
      this.isPlayerBanned = false;
      this.lastError = 'None';
      this.inventory = [];
      this.currencies = {};
      this.catalog = {};
      this.banReason = 'No active ban';
      this.banExpires = 'N/A';
      this.banExpiryTimestamp = null;
      this.readOnlyData = {};
      this.lastRedeemResult = 'No code redeemed yet';
    }

    getInfo() {
      return {
        id: 'PlayfabExtension',
        name: 'PlayFab Cloud',
        blockIconURI: icon,
        menuIconURI: icon,
        color1: '#d35400',
        color2: '#a04000',
        blocks: [

          // ── SETUP ──────────────────────────────────────────────
          { blockType: Scratch.BlockType.LABEL, text: 'Setup' },
          {
            opcode: 'setTitleId', blockType: Scratch.BlockType.COMMAND,
            text: 'set Title ID to [ID]',
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ABCD' } }
          },
          {
            opcode: 'setSecretKey', blockType: Scratch.BlockType.COMMAND,
            text: 'set Secret Key (Admin only) to [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'SECRET_KEY' } }
          },

          // ── AUTHENTICATION ─────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Authentication' },
          {
            opcode: 'onLoggedIn', blockType: Scratch.BlockType.HAT,
            text: 'when player logs in', isEdgeActivated: false
          },
          {
            opcode: 'onLoggedOut', blockType: Scratch.BlockType.HAT,
            text: 'when player logs out', isEdgeActivated: false
          },
          {
            opcode: 'login', blockType: Scratch.BlockType.COMMAND,
            text: 'login with Custom ID [CUSTOM_ID]',
            arguments: { CUSTOM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'player_123' } }
          },
          {
            opcode: 'logout', blockType: Scratch.BlockType.COMMAND,
            text: 'logout'
          },
          {
            opcode: 'linkCustomId', blockType: Scratch.BlockType.COMMAND,
            text: 'link [TEXT] to account',
            arguments: { TEXT: { type: Scratch.ArgumentType.STRING, defaultValue: 'my_custom_id' } }
          },
          {
            opcode: 'getLinkResult', blockType: Scratch.BlockType.REPORTER,
            text: 'last link result'
          },
          {
            opcode: 'isLoggedIn', blockType: Scratch.BlockType.BOOLEAN,
            text: 'is logged in?'
          },
          {
            opcode: 'getMasterPlayerId', blockType: Scratch.BlockType.REPORTER,
            text: 'Master Player ID'
          },
          {
            opcode: 'getTitlePlayerId', blockType: Scratch.BlockType.REPORTER,
            text: 'Title Player ID'
          },

          // ── DISPLAY NAME ───────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Display Name' },
          {
            opcode: 'getDisplayName', blockType: Scratch.BlockType.REPORTER,
            text: 'display name'
          },
          {
            opcode: 'setDisplayName', blockType: Scratch.BlockType.COMMAND,
            text: 'set display name to [NAME]',
            arguments: { NAME: { type: Scratch.ArgumentType.STRING, defaultValue: 'PlayerName' } }
          },

          // ── CURRENCY ───────────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Currency' },
          {
            opcode: 'getCurrencyBalance', blockType: Scratch.BlockType.REPORTER,
            text: 'balance of [VC]',
            arguments: { VC: { type: Scratch.ArgumentType.STRING, defaultValue: 'GC' } }
          },
          {
            opcode: 'adminAddCurrency', blockType: Scratch.BlockType.COMMAND,
            text: 'ADMIN: add [AMT] [VC] to player [PLAYFAB_ID]',
            arguments: {
              AMT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              VC: { type: Scratch.ArgumentType.STRING, defaultValue: 'GC' },
              PLAYFAB_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ID_HERE' }
            }
          },

          // ── INVENTORY & STORE ──────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Inventory & Store' },
          {
            opcode: 'updateInventory', blockType: Scratch.BlockType.COMMAND,
            text: 'refresh inventory & currency'
          },
          {
            opcode: 'getInventoryList', blockType: Scratch.BlockType.REPORTER,
            text: 'my items (JSON list)'
          },
          {
            opcode: 'hasItem', blockType: Scratch.BlockType.BOOLEAN,
            text: 'has item [ITEM_ID]?',
            arguments: { ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' } }
          },
          {
            opcode: 'getItemPrice', blockType: Scratch.BlockType.REPORTER,
            text: 'price of [ITEM_ID] in [VC]',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' },
              VC: { type: Scratch.ArgumentType.STRING, defaultValue: 'GC' }
            }
          },
          {
            opcode: 'getItemDescription', blockType: Scratch.BlockType.REPORTER,
            text: 'view item [ITEM_ID] description',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' }
            }
          },
          {
            opcode: 'getItemDisplayName', blockType: Scratch.BlockType.REPORTER,
            text: 'get display name for item [ITEM_ID]',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' }
            }
          },
          {
            opcode: 'getItemImageUrl', blockType: Scratch.BlockType.REPORTER,
            text: 'get [ITEM_ID] image URI',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' }
            }
          },
          {
            opcode: 'getRawCatalogEntry', blockType: Scratch.BlockType.REPORTER,
            text: 'raw catalog data for [ITEM_ID] (debug)',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' }
            }
          },
          {
            opcode: 'getPricedCatalogItems', blockType: Scratch.BlockType.REPORTER,
            text: 'all catalog item IDs with a price (JSON)'
          },
          {
            opcode: 'purchaseItem', blockType: Scratch.BlockType.COMMAND,
            text: 'buy item [ITEM_ID] with [VC] for [PRICE]',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' },
              VC: { type: Scratch.ArgumentType.STRING, defaultValue: 'GC' },
              PRICE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
            }
          },
          {
            opcode: 'giftItem', blockType: Scratch.BlockType.COMMAND,
            text: 'ADMIN: gift item [ITEM_ID] to player [PLAYFAB_ID]',
            arguments: {
              ITEM_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'sword_01' },
              PLAYFAB_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ID_HERE' }
            }
          },
          {
            opcode: 'redeemCoupon', blockType: Scratch.BlockType.COMMAND,
            text: 'redeem code [COUPON]',
            arguments: { COUPON: { type: Scratch.ArgumentType.STRING, defaultValue: 'CODE-HERE' } }
          },
          {
            opcode: 'getLastRedeemResult', blockType: Scratch.BlockType.REPORTER,
            text: 'last code redeem result'
          },

          // ── PLAYER DATA ────────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Player Data (Read-Only)' },
          {
            opcode: 'fetchReadOnlyData', blockType: Scratch.BlockType.COMMAND,
            text: 'refresh read-only player data'
          },
          {
            opcode: 'getReadOnlyKey', blockType: Scratch.BlockType.REPORTER,
            text: 'read-only data key [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'MyKey' } }
          },
          {
            opcode: 'getAllReadOnlyData', blockType: Scratch.BlockType.REPORTER,
            text: 'all read-only data (JSON)'
          },

          // ── TITLE DATA ─────────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Title Data' },
          {
            opcode: 'getTitleData', blockType: Scratch.BlockType.REPORTER,
            text: 'get title data key [KEY]',
            arguments: { KEY: { type: Scratch.ArgumentType.STRING, defaultValue: 'News' } }
          },
          {
            opcode: 'getOnlineCount', blockType: Scratch.BlockType.REPORTER,
            text: 'total players online'
          },

          // ── BAN SYSTEM ─────────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Ban System' },
          {
            opcode: 'getIsBanned', blockType: Scratch.BlockType.BOOLEAN,
            text: 'is player banned?'
          },
          {
            opcode: 'getBanReason', blockType: Scratch.BlockType.REPORTER,
            text: 'ban reason'
          },
          {
            opcode: 'getBanExpires', blockType: Scratch.BlockType.REPORTER,
            text: 'ban hours remaining'
          },
          {
            opcode: 'banPlayer', blockType: Scratch.BlockType.COMMAND,
            text: 'ADMIN: ban [PLAYFAB_ID] for [HOURS] hrs reason: [REASON]',
            arguments: {
              PLAYFAB_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ID_HERE' },
              HOURS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 24 },
              REASON: { type: Scratch.ArgumentType.STRING, defaultValue: 'Cheating' }
            }
          },
          {
            opcode: 'unbanPlayer', blockType: Scratch.BlockType.COMMAND,
            text: 'ADMIN: unban player [PLAYFAB_ID]',
            arguments: { PLAYFAB_ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ID_HERE' } }
          },

          // ── UTILITIES ──────────────────────────────────────────
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Utilities' },
          {
            opcode: 'getError', blockType: Scratch.BlockType.REPORTER,
            text: 'last error'
          }
        ]
      };
    }

    // ─────────────────────────────────────────────────────────────
    // AUTHENTICATION
    // ─────────────────────────────────────────────────────────────

    async login(args) {
      this.isPlayerBanned = false;
      this.banReason = 'No active ban';
      this.banExpires = 'N/A';
      this.banExpiryTimestamp = null;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/LoginWithCustomID`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            TitleId: this.titleId,
            CustomId: args.CUSTOM_ID,
            CreateAccount: true,
            InfoRequestParameters: { GetPlayerProfile: true }
          })
        });
        const result = await response.json();
        if (result.code === 200) {
          this.sessionTicket = result.data.SessionTicket;
          this.masterPlayerId = result.data.PlayFabId;
          this.titlePlayerId = result.data.EntityToken?.Entity?.Id || '';
          this.displayName = result.data.InfoResultPayload?.PlayerProfile?.DisplayName || 'Unknown';
          this.loggedIn = true;
          await this.updateInventory();
          await this.fetchCatalog();
          await this.fetchReadOnlyData();
          Scratch.vm.runtime.startHats('PlayfabExtension_onLoggedIn');
        } else {
          this.handleBanError(result);
        }
      } catch (e) {
        this.lastError = 'Connection Error: ' + e.message;
      }
    }

    logout() {
      this.loggedIn = false;
      this.readOnlyData = {};
      this.lastRedeemResult = 'No code redeemed yet';
      Scratch.vm.runtime.startHats('PlayfabExtension_onLoggedOut');
    }

    async linkCustomId(args) {
      if (!this.sessionTicket) {
        this.lastLinkResult = 'Failed: not logged in';
        return;
      }
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/LinkCustomID`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ CustomId: args.TEXT.trim(), ForceLink: false })
        });
        const result = await response.json();
        if (result.code === 200) {
          this.lastLinkResult = 'Success: linked ' + args.TEXT.trim();
        } else {
          this.lastLinkResult = result.errorMessage || 'Link failed';
          this.lastError = this.lastLinkResult;
        }
      } catch (e) {
        this.lastLinkResult = 'Connection Error: ' + e.message;
        this.lastError = this.lastLinkResult;
      }
    }

    getLinkResult() { return this.lastLinkResult || 'No link attempted yet'; }

    isLoggedIn()        { return this.loggedIn; }
    getMasterPlayerId() { return this.masterPlayerId; }
    getTitlePlayerId()  { return this.titlePlayerId; }
    setTitleId(args)    { this.titleId = args.ID; }
    setSecretKey(args)  { this.secretKey = args.KEY; }

    // ─────────────────────────────────────────────────────────────
    // BAN HANDLING
    // ─────────────────────────────────────────────────────────────

    handleBanError(result) {
      if (result.errorCode === 1084 || result.errorCode === 1002 || result.error === 'AccountBanned') {
        this.isPlayerBanned = true;
        const details = result.errorDetails;
        if (details) {
          const reasonKey = Object.keys(details)[0];
          const expiryRaw = Object.values(details)[0]?.[0];
          this.banReason = reasonKey || 'Banned by Admin';
          if (expiryRaw) {
            const parsed = new Date(expiryRaw);
            this.banExpiryTimestamp = parsed.getTime();
            console.log('[PlayFab Ban Debug]');
            console.log('Raw expiry from PlayFab:', expiryRaw);
            console.log('Parsed expiry (local):', parsed.toLocaleString());
            console.log('Current time (local):', new Date().toLocaleString());
            console.log('Diff in hours (raw):', (parsed.getTime() - Date.now()) / 3600000);
          } else {
            this.banExpiryTimestamp = null; // permanent
          }
        } else {
          this.banReason = 'Banned by Admin';
          this.banExpires = 'Unknown';
        }
        this.lastError = 'Login failed: Account Banned';
      } else {
        this.lastError = result.errorMessage || 'Unknown Error';
      }
    }

    getIsBanned()  { return this.isPlayerBanned; }
    getBanReason() { return this.banReason; }
    getBanExpires() {
      if (!this.isPlayerBanned) return 0;
      if (this.banExpiryTimestamp === null) return 'Permanent';
      const hoursLeft = Math.floor((this.banExpiryTimestamp - Date.now()) / 3600000);
      return Math.max(0, hoursLeft);
    }

    async banPlayer(args) {
      if (!this.secretKey) return;
      await fetch(`https://${this.titleId}.playfabapi.com/Admin/BanUsers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SecretKey': this.secretKey },
        body: JSON.stringify({ Bans: [{ PlayFabId: args.PLAYFAB_ID, Reason: args.REASON, DurationInHours: args.HOURS }] })
      });
    }

    async unbanPlayer(args) {
      if (!this.secretKey) return;
      await fetch(`https://${this.titleId}.playfabapi.com/Admin/RevokeAllBansForUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SecretKey': this.secretKey },
        body: JSON.stringify({ PlayFabId: args.PLAYFAB_ID })
      });
    }

    // ─────────────────────────────────────────────────────────────
    // DISPLAY NAME
    // ─────────────────────────────────────────────────────────────

    getDisplayName() { return this.displayName; }

    async setDisplayName(args) {
      if (!this.sessionTicket) return;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/UpdateUserTitleDisplayName`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ DisplayName: args.NAME })
        });
        const result = await response.json();
        if (result.code === 200) {
          this.displayName = result.data.DisplayName;
        } else {
          this.lastError = result.errorMessage || 'Failed to set display name';
        }
      } catch (e) {
        this.lastError = 'Connection Error: ' + e.message;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // CURRENCY
    // ─────────────────────────────────────────────────────────────

    getCurrencyBalance(args) { return this.currencies[args.VC] || 0; }

    async adminAddCurrency(args) {
      if (!this.secretKey) return;
      await fetch(`https://${this.titleId}.playfabapi.com/Admin/AddUserVirtualCurrency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SecretKey': this.secretKey },
        body: JSON.stringify({ PlayFabId: args.PLAYFAB_ID, VirtualCurrency: args.VC, Amount: args.AMT })
      });
    }

    // ─────────────────────────────────────────────────────────────
    // INVENTORY & STORE
    // ─────────────────────────────────────────────────────────────

    async updateInventory() {
      if (!this.sessionTicket) return;
      const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/GetUserInventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
        body: JSON.stringify({})
      });
      const result = await response.json();
      if (result.code === 200) {
        this.inventory = result.data.Inventory.map(i => i.ItemId);
        this.currencies = result.data.VirtualCurrency;
      }
    }

    getInventoryList() { return JSON.stringify(this.inventory); }
    hasItem(args)      { return this.inventory.includes(args.ITEM_ID); }

    async fetchCatalog() {
      if (!this.sessionTicket) return;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/GetCatalogItems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ CatalogVersion: '' })
        });
        const result = await response.json();
        if (result.code === 200) {
          // Catalog includes both items and bundles — store all of them
          result.data.Catalog.forEach(item => {
            console.log('[PlayFab Catalog Debug] Raw item:', JSON.stringify(item));
            this.catalog[item.ItemId] = {
              prices: item.VirtualCurrencyPrices || {},
              description: item.Description || 'No description available',
              displayName: item.DisplayName || item.ItemId,
              type: item.ItemClass || 'item',
              imageUrl: item.ItemImageUrl || '',
              raw: item
            };
          });
        }
      } catch (e) {}
    }

    getItemPrice(args) {
      const item = this.catalog[args.ITEM_ID];
      return (item && item.prices[args.VC] !== undefined) ? item.prices[args.VC] : 'Not Found';
    }

    getItemDescription(args) {
      const item = this.catalog[args.ITEM_ID];
      return item ? item.description : 'Not Found';
    }

    getItemDisplayName(args) {
      const item = this.catalog[args.ITEM_ID];
      return item ? item.displayName : 'Not Found';
    }

    getItemImageUrl(args) {
      const item = this.catalog[args.ITEM_ID];
      if (!item) return 'Not Found';
      return item.imageUrl || 'No image set';
    }

    getRawCatalogEntry(args) {
      const item = this.catalog[args.ITEM_ID];
      if (!item) return 'Not Found';
      return JSON.stringify(item.raw || item);
    }

    getPricedCatalogItems() {
      const priced = Object.entries(this.catalog)
        .filter(([id, item]) => item.prices && Object.keys(item.prices).length > 0)
        .map(([id]) => id);
      return JSON.stringify(priced);
    }

    async purchaseItem(args) {
      if (!this.sessionTicket) return;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/PurchaseItem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ ItemId: args.ITEM_ID, VirtualCurrency: args.VC, Price: args.PRICE })
        });
        const result = await response.json();
        if (result.code === 200) {
          await this.updateInventory();
        } else {
          this.lastError = result.errorMessage || 'Purchase failed';
        }
      } catch (e) {
        this.lastError = 'Connection Error: ' + e.message;
      }
    }

    async giftItem(args) {
      if (!this.secretKey) return;
      await fetch(`https://${this.titleId}.playfabapi.com/Server/GrantItemsToUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SecretKey': this.secretKey },
        body: JSON.stringify({ PlayFabId: args.PLAYFAB_ID, ItemIds: [args.ITEM_ID] })
      });
    }

    async redeemCoupon(args) {
      if (!this.sessionTicket) return;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/RedeemCoupon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ CouponCode: args.COUPON.trim() })
        });
        const result = await response.json();
        if (result.code === 200) {
          // Refresh inventory so any granted items appear immediately
          await this.updateInventory();
          const granted = result.data.GrantedItems || [];
          const grantedNames = granted.map(i => {
            const catalogEntry = this.catalog[i.ItemId];
            return catalogEntry ? catalogEntry.displayName : i.ItemId;
          });
          this.lastRedeemResult = grantedNames.length > 0
            ? 'Success! Got: ' + grantedNames.join(', ')
            : 'Code redeemed (no items granted)';
        } else {
          this.lastRedeemResult = result.errorMessage || 'Code redemption failed';
          this.lastError = this.lastRedeemResult;
        }
      } catch (e) {
        this.lastRedeemResult = 'Connection Error: ' + e.message;
        this.lastError = this.lastRedeemResult;
      }
    }

    getLastRedeemResult() { return this.lastRedeemResult || 'No code redeemed yet'; }

    // ─────────────────────────────────────────────────────────────
    // PLAYER DATA (READ-ONLY)
    // ─────────────────────────────────────────────────────────────

    async fetchReadOnlyData() {
      if (!this.sessionTicket) return;
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/GetUserReadOnlyData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({})
        });
        const result = await response.json();
        if (result.code === 200) {
          const raw = result.data.Data || {};
          this.readOnlyData = {};
      this.lastRedeemResult = 'No code redeemed yet';
          for (const key in raw) {
            this.readOnlyData[key] = raw[key].Value;
          }
        } else {
          this.lastError = result.errorMessage || 'Failed to fetch read-only data';
        }
      } catch (e) {
        this.lastError = 'Connection Error: ' + e.message;
      }
    }

    getReadOnlyKey(args) {
      const val = this.readOnlyData[args.KEY];
      return val !== undefined ? val : 'Not Found';
    }

    getAllReadOnlyData() { return JSON.stringify(this.readOnlyData); }

    // ─────────────────────────────────────────────────────────────
    // TITLE DATA
    // ─────────────────────────────────────────────────────────────

    async getTitleData(args) {
      try {
        const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/GetTitleData`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Authorization': this.sessionTicket },
          body: JSON.stringify({ Keys: [args.KEY] })
        });
        const result = await response.json();
        if (result.code === 200) {
          return result.data.Data[args.KEY] || 'Not Found';
        }
        return 'Error';
      } catch (e) {
        return 'Error';
      }
    }

    getOnlineCount() { return 1; }

    // ─────────────────────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────────────────────

    getError() { return this.lastError; }
  }

  Scratch.extensions.register(new Playfab());
})(Scratch);
